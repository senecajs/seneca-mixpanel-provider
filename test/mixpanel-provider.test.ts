/* Copyright © 2022 Seneca Project Contributors, MIT License. */

import * as Http from 'http'



const Seneca = require('seneca')
const SenecaMsgTest = require('seneca-msg-test')

import MixpanelProvider from '../src/mixpanel-provider'
import MixpanelProviderDoc from '../src/MixpanelProvider-doc'

const BasicMessages = require('./basic.messages.js')


// The tests make no call to Mixpanel. The env plugin needs the project key,
// secret and token: test/local-env.js (see local-env-template.js) or the
// environment variables MIXPANEL_PROJECTKEY, MIXPANEL_PROJECTSECRET and
// MIXPANEL_PROJECTTOKEN. Without them it gets dummy values. The sdk test
// sends an event to a local mock of the Mixpanel ingestion API.
process.env.MIXPANEL_PROJECTKEY ??= 'test-projectkey'
process.env.MIXPANEL_PROJECTSECRET ??= 'test-projectsecret'
process.env.MIXPANEL_PROJECTTOKEN ??= 'test-projecttoken'


describe('mixpanel-provider', () => {

  test('happy', async () => {
    expect(MixpanelProvider).toBeDefined()
    expect(MixpanelProviderDoc).toBeDefined()

    const seneca = await makeSeneca()

    expect(await seneca.post('sys:provider,provider:mixpanel,get:info'))
      .toMatchObject({
        ok: true,
        name: 'mixpanel',
      })

    await seneca.close()
  })


  test('messages', async () => {
    const seneca = await makeSeneca()
    await (SenecaMsgTest(seneca, BasicMessages)())
    await seneca.close()
  })


  test('sdk', async () => {
    const mock = await makeMockMixpanelApi()

    try {
      // The conf option passes through to Mixpanel.init.
      const seneca = await makeSeneca({
        conf: { host: '127.0.0.1', port: mock.port, protocol: 'http' }
      })

      const sdk = seneca.export('MixpanelProvider/sdk')()

      // Fail here rather than send an event to Mixpanel.
      expect(sdk.config).toMatchObject({
        host: '127.0.0.1', port: mock.port, protocol: 'http'
      })

      const token = (await seneca.post(
        'sys:provider,get:key,provider:mixpanel,key:token')).value

      await new Promise<void>((resolve, reject) =>
        sdk.track('test-event', { distinct_id: 'user0', mark: 'm0' },
          (err: any) => err ? reject(err) : resolve()))

      expect(mock.events).toEqual([{
        path: '/track',
        event: 'test-event',
        properties: expect.objectContaining({
          distinct_id: 'user0',
          mark: 'm0',
          token,
        }),
      }])

      await seneca.close()
    }
    finally {
      await mock.close()
    }
  })


  /*
  test('board-basic', async () => {
    if (!Config) return;
    const seneca = await makeSeneca()

    const list = await seneca.entity("provider/mixpanel/board").list$()
    expect(list.length > 0).toBeTruthy()

    const board0 = await seneca.entity("provider/mixpanel/board")
      .load$(Config.board0.id)
    expect(board0.name).toContain('Welcome Board')

    board0.desc = 'DESC:' + Math.random()
    let board0r = await board0.save$()
    expect(board0r.id).toEqual(board0.id)
    expect(board0r.desc).toEqual(board0.desc)

    const board0u = await seneca.entity("provider/mixpanel/board")
      .load$(Config.board0.id)
    expect(board0u.name).toContain('Welcome Board')
    expect(board0u.desc).toEqual(board0r.desc)

  })
  */
})


async function makeSeneca(options?: any) {
  const seneca = Seneca({ legacy: false })
    .test()
    .use('@seneca/entity')
    .use('@seneca/env', {
      // debug: true,
      file: [__dirname + '/local-env.js;?'],
      var: {
        $MIXPANEL_PROJECTKEY: String,
        $MIXPANEL_PROJECTSECRET: String,
        $MIXPANEL_PROJECTTOKEN: String,
      }
    })
    .use('@seneca/provider', {
      provider: {
        mixpanel: {
          keys: {
            key: { value: '$MIXPANEL_PROJECTKEY' },
            secret: { value: '$MIXPANEL_PROJECTSECRET' },
            token: { value: '$MIXPANEL_PROJECTTOKEN' },
          }
        }
      }
    })
    .use(MixpanelProvider, options)

  await seneca.ready()
  return seneca
}


type MockEvent = {
  path: string
  event: string
  properties: Record<string, any>
}

type MockMixpanelApi = {
  port: number
  events: MockEvent[]
  close: () => Promise<void>
}


// A local stand-in for the Mixpanel ingestion API call that the test makes:
// GET or POST /track with the base64 JSON event in the data parameter. It
// answers 1, as Mixpanel does when the request is not verbose.
async function makeMockMixpanelApi(): Promise<MockMixpanelApi> {
  const events: MockEvent[] = []

  const server = Http.createServer((req, res) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      const url = new URL(req.url || '/', 'http://127.0.0.1')
      const form = new URLSearchParams(Buffer.concat(chunks).toString())
      const data = url.searchParams.get('data') || form.get('data')

      if ('/track' !== url.pathname || null == data) {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        return res.end('0')
      }

      const { event, properties } =
        JSON.parse(Buffer.from(data, 'base64').toString())
      events.push({ path: url.pathname, event, properties })

      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('1')
    })
  })

  await new Promise<void>((resolve) =>
    server.listen(0, '127.0.0.1', () => resolve()))

  return {
    port: (server.address() as { port: number }).port,
    events,
    close: () => new Promise<void>((resolve) => {
      server.closeAllConnections()
      server.close(() => resolve())
    })
  }
}
