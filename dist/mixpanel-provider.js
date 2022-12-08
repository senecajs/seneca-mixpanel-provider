"use strict";
/* Copyright © 2022 Seneca Project Contributors, MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
const Mixpanel = require('mixpanel');
const Pkg = require('../package.json');
function MixpanelProvider(options) {
    const seneca = this;
    const entityBuilder = this.export('provider/entityBuilder');
    seneca
        .message('sys:provider,provider:mixpanel,get:info', get_info);
    async function get_info(_msg) {
        return {
            ok: true,
            name: 'mixpanel',
            version: Pkg.version,
        };
    }
    entityBuilder(this, {
        provider: {
            name: 'mixpanel'
        },
        entity: {}
    });
    seneca.prepare(async function () {
        let res = await this.post('sys:provider,get:keymap,provider:mixpanel');
        if (!res.ok) {
            throw this.fail('keymap');
        }
        this.shared.sdk = Mixpanel.init(res.keymap.token.value, {
            ...options.conf
        });
    });
    return {
        exports: {
            sdk: () => this.shared.sdk
        }
    };
}
// Default options.
const defaults = {
    conf: {}
};
Object.assign(MixpanelProvider, { defaults });
exports.default = MixpanelProvider;
if ('undefined' !== typeof (module)) {
    module.exports = MixpanelProvider;
}
//# sourceMappingURL=mixpanel-provider.js.map