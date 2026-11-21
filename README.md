![Seneca Mixpanel-Provider](http://senecajs.org/files/assets/seneca-logo.png)

> _Seneca Mixpanel-Provider_ is a plugin for [Seneca](http://senecajs.org)


Provides access to the Mixpanel API using the Seneca *provider*
convention. Mixpanel API entities are represented as Seneca entities so
that they can be accessed using the Seneca entity API and messages.

See [@seneca/entity](https://github.com/senecajs/seneca-entity) and the [Seneca Data
Entities
Tutorial](https://senecajs.org/docs/tutorials/understanding-data-entities.html) for more details on the Seneca entity API.

[![npm version](https://img.shields.io/npm/v/@seneca/mixpanel-provider.svg)](https://npmjs.com/package/@seneca/mixpanel-provider)
[![build](https://github.com/senecajs/seneca-mixpanel-provider/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-mixpanel-provider/actions/workflows/build.yml)
[![Coverage Status](https://coveralls.io/repos/github/senecajs/seneca-mixpanel-provider/badge.svg?branch=main)](https://coveralls.io/github/senecajs/seneca-mixpanel-provider?branch=main)
[![Known Vulnerabilities](https://snyk.io/test/github/senecajs/seneca-mixpanel-provider/badge.svg)](https://snyk.io/test/github/senecajs/seneca-mixpanel-provider)
[![DeepScan grade](https://deepscan.io/api/teams/5016/projects/19462/branches/505954/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=5016&pid=19462&bid=505954)
[![Maintainability](https://api.codeclimate.com/v1/badges/f76e83896b731bb5d609/maintainability)](https://codeclimate.com/github/senecajs/seneca-mixpanel-provider/maintainability)


| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|


## Quick Example


```js

// Setup - get the key values (<SECRET>) separately from a vault or
// environment variable.
const seneca = Seneca()
  .use('@seneca/entity')
  // Get API keys using the @seneca/env plugin
  .use('@seneca/env', {
    var: {
      $MIXPANEL_PROJECTTOKEN: String,
    }
  })
  .use('@seneca/provider', {
    provider: {
      mixpanel: {
        keys: {
          token: { value: '$MIXPANEL_PROJECTTOKEN' },
        }
      }
    }
  })
  // The conf option is passed to Mixpanel.init of the mixpanel SDK.
  .use('@seneca/mixpanel-provider', { conf: {} })

await seneca.ready()

// The mixpanel SDK client.
const mixpanel = seneca.export('MixpanelProvider/sdk')()

mixpanel.track('signup', { distinct_id: 'user0' })

```

## Install

Requires Seneca 4 and Node.js 24 or later.

```sh
$ npm install seneca@^4 @seneca/entity @seneca/provider @seneca/env @seneca/mixpanel-provider
```



<!--START:options-->


## Options

* `debug` : boolean <i><small>false</small></i>


Set plugin options when loading with:
```js


seneca.use('MixpanelProvider', { name: value, ... })


```


<small>Note: <code>foo.bar</code> in the list above means 
<code>{ foo: { bar: ... } }</code></small> 



<!--END:options-->

<!--START:action-list-->


## Action Patterns

* [role:entity,base:mixpanel,cmd:load,name:repo,zone:provider](#-roleentitybasemixpanelcmdloadnamerepozoneprovider-)
* [role:entity,base:mixpanel,cmd:save,name:repo,zone:provider](#-roleentitybasemixpanelcmdsavenamerepozoneprovider-)
* [sys:provider,get:info,provider:mixpanel](#-sysprovidergetinfoprovidermixpanel-)


<!--END:action-list-->

<!--START:action-desc-->


## Action Descriptions

### &laquo; `role:entity,base:mixpanel,cmd:load,name:repo,zone:provider` &raquo;

Load Mixpanel repository data into an entity.



----------
### &laquo; `role:entity,base:mixpanel,cmd:save,name:repo,zone:provider` &raquo;

Update Mixpanel repository data from an entity.



----------
### &laquo; `sys:provider,get:info,provider:mixpanel` &raquo;

Get information about the provider.



----------


<!--END:action-desc-->
