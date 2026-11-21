# Changes

## 1.0.0 2026-11-21

First entry of this change log. Earlier versions are on npm and in the git
history.

* Seneca 4: the peer dependency is `seneca` `^4.0.0` (was
  `>=3||>=4.0.0-rc2`). Seneca 3 users stay on `@seneca/mixpanel-provider@0.3`.
* The entity peer is `@seneca/entity` `^29.0.0` instead of `seneca-entity`.
  The other peers are `@seneca/provider` `^5.0.0` and `@seneca/env` `^0.6.0`,
  which is now optional: the plugin itself does not use it.
* The `seneca-promisify` peer dependency is removed. Seneca 4 has promises
  built in; do not call `use('promisify')` (D4).
* Node.js 24 or later (`engines.node` `>=24`, was `>=14`).
* The `mixpanel` SDK is `^0.24.0` (was `^0.18.0`). `Mixpanel.init(token,
  conf)` is unchanged, and the `conf` option still passes through to it.
* The plugin is still a stub: it answers `get:info` and exports the SDK
  client as `MixpanelProvider/sdk`. Open pull request #3, a generated
  Engage entity, needs the `@voxgig-sdk/mixpanel` package, which is not on
  npm, so it is not part of this release.
* Tests load plugins by full name (`@seneca/entity`, `@seneca/env`,
  `@seneca/provider`) and set dummy `MIXPANEL_PROJECTKEY`,
  `MIXPANEL_PROJECTSECRET` and `MIXPANEL_PROJECTTOKEN` values when these
  are not set. A new test passes `conf` to point the SDK at a local mock of
  the Mixpanel ingestion API and tracks one event. Live calls were not
  tested on Seneca 4.
* devDependencies: `seneca` `^4.0.0`, `@seneca/entity` `^29.0.0`,
  `@seneca/env` `^0.6.0`, `@seneca/provider` `^5.0.0`, `seneca-msg-test`
  `^5.0.0` and `@types/node` `^24`. Removed the unused `node-fetch` and
  `@seneca/doc`.
* README: Seneca 4 install line and an example of the SDK export, with
  plugins loaded by full name.
* `repository.url` uses `git+https`, `publishConfig` sets public access, and
  the package includes `CHANGES.md`.
