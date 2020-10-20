const fullPath = "\/home\/app\/src\/webpack5-final-loader-null";

module.exports = require(`${fullPath}\/app\/config\/webpack.config.js`)({
    "entry": {
        "style-97d6614bde722784c18a56c668d3e0090ddd8302": `${fullPath}\/src\/index.js`,
    },
    "groups": {
        "default": ["style-97d6614bde722784c18a56c668d3e0090ddd8302"],
    },
    "alias": {
        "#web": `${fullPath}\/web`,
    },
    "manifest_path": `${fullPath}\/app\/cache\/webpack_manifest.json`,
    "environment": "dev",
    "parameters": {
        "cache_directory": `${fullPath}\/app\/cache\/webpack-cache`,
        "extract_css": true,
        "public_path": "\/compiled\/",
        "environment_config": {
            "available_locales": ["lt", "en", "lv", "ru", "pl", "bg", "es", "ro", "et", "ar", "sq"],
            "google_places_api_key": "key",
            "google_analytics_backend_tracking_id": "id",
            "google_analytics_frontend_tracking_id": "id",
            "supported_currencies": ["EUR", "GBP", "USD", "PLN", "CZK", "BYR", "NOK", "BGN", "RON"],
            "fallback_locale": "en",
            "release_version": "",
            "sentry_dsn": "",
            "poxa_app_key": "app_key",
            "poxa_public_host": "poxa.dev.docker",
            "poxa_port": "8080",
            "rtl_locales": ["ar"],
            "law_agreements_v3_publication_date": 1602115200,
            "dpo_email": "dpo@email.com",
        },
        "dev_server_public_path": "http:\/\/localhost:8080\/",
    },
});
