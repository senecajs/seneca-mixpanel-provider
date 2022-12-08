/* Copyright © 2022 Seneca Project Contributors, MIT License. */

const Mixpanel = require('mixpanel')

const Pkg = require('../package.json')


type MixpanelProviderOptions = {
  conf: Record<string, any>
}


function MixpanelProvider(this: any, options: MixpanelProviderOptions) {
  const seneca: any = this

  const entityBuilder = this.export('provider/entityBuilder')


  seneca
    .message('sys:provider,provider:mixpanel,get:info', get_info)




  async function get_info(this: any, _msg: any) {
    return {
      ok: true,
      name: 'mixpanel',
      version: Pkg.version,
    }
  }


  entityBuilder(this, {
    provider: {
      name: 'mixpanel'
    },
    entity: {
    }
  })



  seneca.prepare(async function(this: any) {
    let res =
      await this.post('sys:provider,get:keymap,provider:mixpanel')

    if (!res.ok) {
      throw this.fail('keymap')
    }

    this.shared.sdk = Mixpanel.init(res.keymap.token.value, {
      ...options.conf
    })
  })


  return {
    exports: {
      sdk: () => this.shared.sdk
    }
  }
}


// Default options.
const defaults: MixpanelProviderOptions = {

  conf: {}
}


Object.assign(MixpanelProvider, { defaults })

export default MixpanelProvider

if ('undefined' !== typeof (module)) {
  module.exports = MixpanelProvider
}
