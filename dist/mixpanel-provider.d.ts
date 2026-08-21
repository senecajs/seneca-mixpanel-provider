type MixpanelProviderOptions = {
    sdk?: Record<string, any>;
    test?: boolean;
    testopts?: Record<string, any>;
};
declare function MixpanelProvider(this: any, options: MixpanelProviderOptions): {
    exports: {
        sdk: () => any;
    };
};
export default MixpanelProvider;
