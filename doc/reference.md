# Reference

Complete description of the interface exposed by
`@seneca/mixpanel-provider` version 0.0.1.

This document describes the machinery and assumes you know what you are
looking for. To learn the plugin, start with the [tutorial](tutorial.md);
for recipes, see the [how-to guides](how-to.md); for the reasoning behind
the design, see the [explanation](explanation.md). The package overview is
the [README](../README.md), and the document index is [here](README.md).

- [Requirements](#requirements)
- [Registration](#registration)
- [Options](#options)
- [Entities](#entities)
- [Action patterns](#action-patterns)
- [Plugin exports](#plugin-exports)
- [Errors](#errors)
- [Authentication keys](#authentication-keys)
- [Environment variables](#environment-variables)
- [Package scripts](#package-scripts)

## Requirements

| Item | Value |
| ---- | ----- |
| Node.js | `>=24` |
| Module format | CommonJS |
| SDK | [`@voxgig-sdk/mixpanel`](https://www.npmjs.com/package/@voxgig-sdk/mixpanel) `^0.0.1` |

The SDK is an ordinary published dependency, installed by `npm install`
like any other.

### Peer dependencies

All must be present in the host application. The accepted version ranges are
declared in this package's `package.json`.

| Package | Purpose |
| ------- | ------- |
| `seneca` | The host framework. The plugin runs inside the host's instance, never its own. |
| `seneca-entity` | The entity API the canons below are served through. |
| `seneca-promisify` | The promise-returning message API. |
| `@seneca/provider` | The provider convention, including `provider/entityBuilder`. |
| `@seneca/env` | Resolves `$`-prefixed key values from the environment. |

## Registration

The plugin name is `MixpanelProvider`. It must be registered after
`entity`, `promisify` and `provider`:

```js
Seneca({ legacy: false })
  .use('promisify')
  .use('entity')
  .use('provider', { ... })
  .use('@seneca/mixpanel-provider', { sdk: { base: BASE } })
```

The Mixpanel Engage definition declares no server, so there is no default
base URL: `BASE` is the URL of the API you are talking to, and it must be
supplied through the `sdk` option.

The SDK client is constructed during plugin startup and is not available
until `seneca.ready()` resolves.

## Options

| Option | Type | Default | Effect |
| ------ | ---- | ------- | ------ |
| `sdk` | object | `{}` | Passed straight to the `MixpanelSDK` constructor. Most usefully `base`. |
| `test` | boolean | `false` | Run the SDK against its in-memory mock transport instead of HTTP. |
| `testopts` | object | `{}` | Test-feature options, used only when `test` is true. `{entity: {...}}` seeds the mock. |

### `sdk`

Any option the `MixpanelSDK` constructor accepts:

| Key | Effect |
| --- | ------ |
| `base` | Base URL for API requests. There is no default: this API declares no server, so it must be set. |
| `prefix` / `suffix` | URL fragments placed around the path. |
| `headers` | Headers sent on every request. These win over the `authorization` header the provider adds from a configured key. |
| `system` | System overrides, e.g. a custom `fetch`. |

### `test` and `testopts`

```js
.use('@seneca/mixpanel-provider', {
  test: true,
  testopts: {
    entity: {
      engage: { engage0: {"set":{},"token":"token0"} },
    },
  },
})
```

Mock records are keyed by id under their entity name. In this mode no
network calls are made, and an unseeded id produces the same not-found
behaviour as a live server. This package's own `test/seed.js` is generated
in exactly this shape.

## Entities

The plugin registers one entity canon.
A canon carries only the commands its API operations support — an entity the
API offers no delete for has no `remove$` — so the tables below are the
whole of what each one answers.

| Seneca canon | SDK accessor | Route | Id field | Parent keys | Commands |
| ------------ | ------------ | ----- | -------- | ----------- | -------- |
| `provider/mixpanel/engage` | `sdk.Engage()` | `/engage` | `null` | — | `save$` |

### `provider/mixpanel/engage`

Backed by `sdk.Engage()`, whose results are `EngageEntity` instances; the
provider hands Seneca the plain record from `.data()`.

| Command | Query / data | Returns |
| ------- | ------------ | ------- |
| `save$()` | entity data | Created `engage`; the API declares no update operation. |

Required fields, as declared by the API definition. Optional fields the API
also defines are passed through unchanged in both directions.

| Field | Type | Notes |
| ----- | ---- | ----- |
| `set` | object |  |
| `token` | string |  |

### Create versus update

`save$` normally dispatches on the id: an entity without one is created,
an entity with one is updated.

This entity supports only one half of that pair, so `save$` does not
dispatch for it:

| Canon | Behaviour of `save$` |
| ----- | -------------------- |
| `provider/mixpanel/engage` | Always creates; the API declares no update operation. |

### Command to SDK operation

| Seneca command | SDK call | Notes |
| -------------- | -------- | ----- |
| `save$()` on an entity with no id | `.create(data)` | Data is the entity's own fields, without Seneca metadata. |

Every SDK operation resolves to an SDK entity instance, or a list of them,
rather than raw data. The provider calls `.data()` on each and hands the
plain record to `entize`, so what comes back is an ordinary Seneca entity
under this plugin's canon, carrying none of the SDK's own markers.

### Query fields

Seneca query directives — any key ending in `$`, such as `sort$` or
`limit$` — are stripped before the query reaches the SDK. They are
instructions to a store, not match fields for the API, and are not
otherwise supported.

## Action patterns

### `sys:provider,provider:mixpanel,get:info`

Returns metadata about the plugin and SDK. Answered locally; makes no API
call.

```js
await seneca.post('sys:provider,provider:mixpanel,get:info')
```

```js
{
  ok: true,
  name: 'mixpanel',
  version: '0.0.1',
  sdk: {
    name: '@voxgig-sdk/mixpanel',
    version: '0.0.1',
  },
}
```

Both versions are read at runtime from the respective `package.json`, so
they describe what is installed rather than what was generated.

### Entity patterns

Registered by `@seneca/provider`. Normally reached through the entity API
rather than posted directly.

| Pattern |
| ------- |
| `sys:entity,zone:provider,base:mixpanel,name:engage,cmd:save` |

### Inherited from `@seneca/provider`

| Pattern | Purpose |
| ------- | ------- |
| `sys:provider,get:key` | Fetch one named key for a provider. |
| `sys:provider,get:keymap` | Fetch all keys for a provider. |
| `sys:provider,list:provider` | List registered providers and their key names. |

## Plugin exports

### `MixpanelProvider/sdk`

A function returning the configured `MixpanelSDK` instance.

```js
const sdk = seneca.export('MixpanelProvider/sdk')()

// `direct` reaches endpoints outside the entity model.
const res = await sdk.direct({ path: '/engage', method: 'GET' })
```

Available only after `seneca.ready()`. Use it for SDK features the entity
API does not surface — notably `direct()` and `prepare()` for endpoints
the entity model does not cover.

## Errors

| Situation | Behaviour |
| --------- | --------- |
| A 404 from `save$` | Thrown. Only single-record reads and removes map a 404 to `null`. |
| Any other non-2xx response | Thrown as raised by the SDK. |
| A request that never got a response | Thrown, with `status` `-1`. |

SDK errors are `MixpanelError` instances carrying
`isMixpanelError: true`, a `code` (e.g. `request_status`), the
HTTP `status` at the top level (`-1` when the request never got a
response), a `notFound` flag, and a `ctx` holding the request context and
its `result` — `status`, `statusText`, `headers` and `body`. The
`null`-on-missing behaviour is triggered by `err.notFound`, not by
inspecting the status at the call site.

```js
try {
  await seneca.entity('provider/mixpanel/engage').make$({ ... }).save$()
}
catch (err) {
  console.error(err.code, err.status, err.notFound)
}
```

## Authentication keys

The plugin follows the provider convention: if an `apikey` key is
configured and non-empty, it is sent as `authorization: Bearer <apikey>`
on every request. If the provider is not registered, or the key is absent or
empty, no header is added and startup proceeds normally — an API that needs
no credential exercises the same path.

```js
  .use('provider', {
    provider: {
      mixpanel: {
        keys: {
          apikey: { value: '$MIXPANEL_APIKEY' },
        },
      },
    },
  })
```

The key is read once, during `seneca.prepare()`, by posting
`sys:provider,get:keymap,provider:mixpanel`. An `authorization`
header supplied through the `sdk.headers` option takes precedence over it.

## Environment variables

The plugin never reads the environment itself. These are the variables the
surrounding convention and tooling resolve:

| Variable | Read by | Purpose |
| -------- | ------- | ------- |
| `$MIXPANEL_APIKEY` | `@seneca/env` | Supplies the `apikey` value when the key is declared as `'$MIXPANEL_APIKEY'`, as above. |

## Package scripts

| Script | Action |
| ------ | ------ |
| `npm run build` | `tsc --build src test` — compiles to `dist` and `dist-test`. |
| `npm run watch` | The same, in watch mode. |
| `npm test` | Runs the `node:test` suite. |
| `npm run test-some` | Runs tests matching `$TEST_PATTERN`. |
| `npm run test-watch` | Test suite in watch mode. |
| `npm run test-coverage` | Test suite with Node's built-in coverage. |
| `npm run clean` | Removes `node_modules`, `dist`, `dist-test`, `.tsbuildinfo`, lockfiles. |
| `npm run reset` | `clean`, then install, build and test. |
| `npm run repo-tag` | Commits, tags and pushes `v<version>` taken from `package.json`. |
| `npm run repo-publish` | Clean install, then `repo-publish-quick`. |
| `npm run repo-publish-quick` | Build, test, tag, and publish to npm. |

### Repository layout

| Path | Contents |
| ---- | -------- |
| `src/` | TypeScript source, with its own `tsconfig.json`. |
| `test/` | Test suite (`.js`, run by `node:test`) and TypeScript fixtures. |
| `dist/` | Compiled source. Committed; published. |
| `dist-test/` | Compiled test fixtures. Committed; **not** published. |
| `.tsbuildinfo/` | Incremental build cache. Not committed. |
| `doc/` | This documentation. |

This repository is generated by
[@voxgig/sdkgen](https://github.com/voxgig/sdkgen) from the Mixpanel Engage
API definition. Anything edited here is overwritten by the next generation
run; changes belong in the model.
