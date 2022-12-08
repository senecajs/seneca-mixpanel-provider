
// IMPORTANT: assumes node-fetch@2
const Fetch = require('node-fetch')

const Seneca = require('seneca')

// global.fetch = Fetch


Seneca({ legacy: false })
  .test()
  .use('promisify')
  .use('entity')
  .use('env', {
    // debug: true,
    file: [__dirname + '/local-env.js;?'],
    var: {
      MIXPANEL_PROJECTKEY: String,
      $MIXPANEL_PROJECTSECRET: String,
      $MIXPANEL_PROJECTTOKEN: String,
    }
  })
  .use('provider', {
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
  .use('../',{
    conf: {}
  })
  .ready(async function() {
    const seneca = this

    console.log(await seneca.post('sys:provider,provider:mixpanel,get:info'))

    let sdk = seneca.export('MixpanelProvider/sdk')()

    sdk.track('test-sdk', { test:true, sdk:true, time: new Date() })

    
    // const brands = await seneca.entity("provider/mixpanel/brand").list$({
    //   country: 'IE', verbose: false
    // })
    // console.log('brands',brands.length)
    // // console.dir(brands,{depth:null})
    
    // let customers = await seneca.entity("provider/mixpanel/customer").list$()
    // console.log('customers', customers.length)
    // console.dir(customers,{depth:null})
    
    // let orders = await seneca.entity('provider/mixpanel/order').list$()
    // console.log('orders',orders.length)

    
    // let mark = Math.random()+''
    // let utid = 'U768452'
    
    // let order = seneca.entity('provider/mixpanel/order').data$({
    //   amount: 10,
    //   // campaign: 'test01',
    //   campaign: '',
    //   emailSubject: 'subject '+mark,
    //   etid: 'E000000',
    //   externalRefID: seneca.util.Nid(),
    //   message: 'msg '+mark,
    //   notes: 'note '+mark,
    //   recipient: {
    //     email: 'richard+mixpanel.test.01@ricebridge.com',
    //     firstName: 'First',
    //     lastName: ''
    //   },
    //   // sendEmail: true,
    //   // sender: {
    //   //   email: '',
    //   //   firstName: '',
    //   //   lastName: ''
    //   // },
    //   utid
    // })

    // try {
    //   order = await order.save$()
    //   console.log('order',order)
    // }
    // catch(e) {
    //   console.log(e.message)
    //   console.log(e.status)
    //   console.log(e.body)
    // }

  })

