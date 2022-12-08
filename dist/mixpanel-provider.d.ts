type MixpanelProviderOptions = {
    conf: Record<string, any>;
};
declare function MixpanelProvider(this: any, options: MixpanelProviderOptions): {
    exports: {
        sdk: () => any;
    };
};
export default MixpanelProvider;
