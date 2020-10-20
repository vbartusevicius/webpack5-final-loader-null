module.exports = (options) => {
    const environmentConfig = options.parameters.environment_config;

    const ckEditorPlugins = 'a11yhelp|about|basicstyles|blockquote|button|clipboard|contextmenu|dialog|dialogui|elementspath|enterkey|entities|fakeobjects|filebrowser|filetools|floatingspace|floatpanel|font|format|horizontalrule|htmlwriter|image|image2|indent|indentlist|justify|lineutils|link|list|listblock|magicline|maximize|menu|menubutton|notification|notificationaggregator|panel|pastefromword|pastetext|popup|removeformat|resize|richcombo|scayt|showborders|sourcearea|specialchar|stylescombo|tab|table|tableselection|tabletools|toolbar|undo|uploadimage|uploadwidget|widget|widgetselection|wsc|wysiwygarea|youtube';
    const ckEditorLocales = Object.values(environmentConfig.available_locales).join('|');

    return {
        environment_config: {
            google_places_api_key: JSON.stringify(environmentConfig.google_places_api_key),
            google_analytics_backend_tracking_id: JSON.stringify(environmentConfig.google_analytics_backend_tracking_id),
            google_analytics_frontend_tracking_id: JSON.stringify(environmentConfig.google_analytics_frontend_tracking_id),
            available_locales: JSON.stringify(Object.values(environmentConfig.available_locales)),
            rtl_locales: JSON.stringify(Object.values(environmentConfig.rtl_locales)),
            supported_currencies: JSON.stringify(Object.values(environmentConfig.supported_currencies)),
            environment: JSON.stringify(options.environment),
            fallback_locale: JSON.stringify(environmentConfig.fallback_locale),
            release_version: JSON.stringify(environmentConfig.release_version),
            sentry_dsn: JSON.stringify(environmentConfig.sentry_dsn),
            poxa_app_key: JSON.stringify(environmentConfig.poxa_app_key),
            poxa_public_host: JSON.stringify(environmentConfig.poxa_public_host),
            poxa_port: JSON.stringify(environmentConfig.poxa_port),
            law_agreements_v3_publication_date: JSON.stringify(environmentConfig.law_agreements_v3_publication_date),
            dpo_email: JSON.stringify(environmentConfig.dpo_email),
        },
        ck_editor: {
            locales_regex: new RegExp(`(${ckEditorLocales})\\.js`),
            plugins_regex: new RegExp(`^\.\/((${ckEditorPlugins})(\/(?!lang\/)[^/]+)*)?[^/]*$`),
            plugin_locales_regex: new RegExp(`^\.\/(${ckEditorPlugins})\/(.*\/)*lang\/(${ckEditorLocales})\.js$`),
        },
    };
};
