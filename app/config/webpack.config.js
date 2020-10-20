const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const CKEditorWebpackPlugin = require('@ckeditor/ckeditor5-dev-webpack-plugin');
const { styles: CKEditorStyles } = require('@ckeditor/ckeditor5-dev-utils');

const configMaker = require('./config');

module.exports = function makeWebpackConfig(options) {
    /**
     * Whether we are generating minified assets for production
     */
    const BUILD = options.environment === 'prod';

    /**
     * Whether we are running in dev-server mode (versus simple compile)
     */
    const DEV_SERVER = process.env.WEBPACK_MODE === 'watch';

    let publicPath;
    if (options.parameters.dev_server_public_path && DEV_SERVER) {
        publicPath = options.parameters.dev_server_public_path;
    } else if (options.parameters.public_path) {
        publicPath = options.parameters.public_path;
    } else {
        publicPath = DEV_SERVER ? 'http://localhost:8080/compiled/' : '/compiled/';
    }
    process.env.WEBPACK_PUBLIC_PATH = publicPath;

    let outputPath;
    if (options.parameters.path) {
        outputPath = options.parameters.path;
    } else {
        const findPublicDirectory = (currentDirectory, fallback) => {
            const parentDirectory = path.dirname(currentDirectory);
            if (parentDirectory === currentDirectory) {
                return fallback;
            }

            const publicDirectory = `${parentDirectory}/public`;
            if (fs.existsSync(publicDirectory)) {
                return publicDirectory;
            }

            const webDirectory = `${parentDirectory}/web`;
            if (fs.existsSync(webDirectory)) {
                return webDirectory;
            }

            return findPublicDirectory(parentDirectory, fallback);
        };
        outputPath = `${findPublicDirectory(__dirname, `${__dirname}../../web`)}/compiled/`;
    }

    const { parameters: { cache_directory: cacheDirectory } } = options;

    /**
     * Config
     * Reference: https://webpack.js.org/concepts/
     * This is the object where all configuration gets set
     */
    const config = {
        entry: options.entry,
        resolve: {
            alias: options.alias,
            extensions: ['.js', '.jsx'],
            modules: ['node_modules'],
        },

        output: {
            // Absolute output directory
            path: outputPath,

            // Output path from the view of the page
            publicPath,

            // Filename for entry points
            // Only adds hash in build mode
            filename: BUILD ? '[name].js?[contenthash]' : '[name].bundle.js',

            // Filename for non-entry points
            // Only adds hash in build mode
            chunkFilename: BUILD ? '[name].js?[contenthash]' : '[name].bundle.js',

            // todo: remove when https://github.com/webpack/webpack-dev-server/issues/628 is done
            globalObject: BUILD ? undefined : '(typeof self !== \'undefined\' ? self : this)',
        },

        /**
         * Options for webpack-dev-server.
         * Enables overlay inside the page if any error occurs when compiling.
         * Enables CORS headers to allow hot reload from other domain / port.
         * Reference: https://webpack.js.org/configuration/dev-server/
         */
        devServer: Object.assign({
            overlay: {
                warnings: false,
                errors: true,
            },
            disableHostCheck: true,
            headers: { 'Access-Control-Allow-Origin': '*' },
        }, options.parameters.dev_server || {}),
    };

    /**
     * Loaders
     * Reference: https://webpack.js.org/concepts/loaders/
     * List: https://webpack.js.org/loaders/
     * This handles most of the magic responsible for converting modules
     */
    config.module = {
        rules: [
            /**
             * Compiles ES6 and ES7 into ES5 code
             * Reference: https://github.com/babel/babel-loader
             */
            {
                test: /\.jsx?$/i,
                loader: 'babel-loader',
                exclude: (modulePath) => {
                    const isExcludedModule = (
                        /node_modules\/query-string/.test(modulePath)
                        || /node_modules\/strict-uri-encode/.test(modulePath)
                        || /node_modules\/decode-uri-component/.test(modulePath)
                        || /node_modules\/@ckeditor/.test(modulePath)
                    );

                    if (isExcludedModule === true) {
                        return false;
                    }

                    return /node_modules\//.test(modulePath);
                },
                options: {
                    cacheDirectory: `${cacheDirectory}/babel-loader`,
                    cacheCompression: false,
                    compact: !BUILD,
                },
            },

            {
                test: /\.worker\.js$/,
                use: [
                    {
                        loader: 'worker-loader',
                        options: {
                            inline: 'fallback',
                        },
                    },
                ],
            },

            {
                test: /friendsofsymfony\/jsrouting-bundle\/Resources\/js\/router\.js$/i,
                use: [
                    {
                        loader: 'exports-loader',
                        options: {
                            exports: 'default Routing',
                        },
                    },
                ],
            },
            {
                test: /web\/bundles\/sonataadmin\/Admin\.js$/i,
                use: [
                    {
                        loader: 'exports-loader',
                        options: {
                            exports: 'default Admin',
                        },
                    },
                ],
            },
            {
                test: /bootstrap-daterangepicker\/daterangepicker\.js$/i,
                use: [
                    {
                        loader: 'imports-loader',
                        options: {
                            additionalCode: 'var define = false; var module = false;',
                            wrapper: 'window',
                        },
                    },
                ],
            },
            {
                test: /angular-i18n\/angular-locale_[a-z]{2}\.js$/i,
                use: [
                    {
                        loader: 'imports-loader',
                        options: {
                            imports: [
                                {
                                    moduleName: 'angular',
                                },
                            ],
                        },
                    },
                ],
            },
            {
                test: require.resolve('angular-timer'),
                use: [
                    {
                        loader: 'imports-loader',
                        options: {
                            imports: [
                                {
                                    syntax: 'default',
                                    moduleName: 'humanize-duration',
                                    name: 'humanizeDuration',
                                },
                            ],
                        },
                    },
                ],
            },
            {
                test: /web\/js\/translations\/\w+\/[a-z]{2}\.js$/i,
                use: [
                    {
                        loader: 'imports-loader',
                        options: {
                            imports: [
                                {
                                    syntax: 'default',
                                    moduleName: 'bazinga-translator',
                                    name: 'Translator',
                                },
                            ],
                        },
                    },
                ],
            },

            /**
             * Minify PNG, JPEG, GIF and SVG images with imagemin
             * Reference: https://github.com/tcoopman/image-webpack-loader
             *
             * See `config.imageWebpackLoader` for configuration options
             *
             * Query string is needed for URLs inside css files, like bootstrap
             */
            {
                test: /\.(gif|png|jpe?g|svg)(\?.*)?$/i,
                enforce: 'pre',
                use: [
                    {
                        loader: 'cache-loader',
                        options: {
                            cacheDirectory: `${cacheDirectory}/cache-loader`,
                        },
                    },
                ],
            },
            /**
             * Copy files to output directory
             * Rename the file using the asset hash
             * Pass along the updated reference to your code
             *
             * Reference: https://github.com/webpack/file-loader
             *
             * Query string is needed for URLs inside css files, like bootstrap
             * Overwrites name parameter to put original name in the destination filename, too
             */
            {
                test: /\.(png|jpg|jpeg|gif|pdf|svg|woff|woff2|ttf|eot)(\?.*)?$/i,
                exclude: [
                    /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
                    /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css/,
                ],
                loader: 'file-loader',
                options: {
                    name: (file) => {
                        if (/MailingBundle/.test(file)) {
                            return '[name].[ext]?[contenthash]';
                        }
                        return '[name].[contenthash].[ext]';
                    },
                },
            },

            /**
             * Loads HTML files as strings inside JavaScript - can be used for templates
             *
             * Reference: https://github.com/webpack/raw-loader
             */
            {
                test: [
                    /\.html$/i,
                    /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
                ],
                use: [
                    {
                        loader: 'raw-loader',
                    },
                ],
            },

            {
                test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {},
                    },
                    {
                        loader: 'css-loader',
                        options: {},
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: CKEditorStyles.getPostCssConfig({
                                themeImporter: {
                                    themePath: require.resolve('@ckeditor/ckeditor5-theme-lark'),
                                },
                                minify: true,
                            }),
                        },
                    },
                ],
            },

            /**
             * Allow loading CSS through JS
             * Reference: https://github.com/webpack/css-loader
             *
             * postcss: Postprocess your CSS with PostCSS plugins (add vendor prefixes to CSS)
             * Reference: https://github.com/postcss/postcss-loader
             * Reference: https://github.com/postcss/autoprefixer
             *
             * MiniCssExtractPlugin: Extract CSS files into separate ones to load directly
             * Reference: https://github.com/webpack-contrib/mini-css-extract-plugin
             */
            {
                test: /\.(css|less|scss)$/i,
                exclude: modulePath => /ckeditor5-/.test(modulePath),
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    [
                                        'postcss-preset-env',
                                    ],
                                ],
                            },
                        },
                    },
                ],
            },

            /**
             * Compile LESS to CSS, then use same rules
             * Reference: https://github.com/webpack-contrib/less-loader
             */
            {
                test: /\.less$/i,
                enforce: 'pre',
                use: [
                    {
                        loader: 'less-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                ],
            },

            /**
             * Compile SASS to CSS, then use same rules
             * Reference: https://github.com/webpack-contrib/sass-loader
             */
            {
                test: /\.scss$/i,
                enforce: 'pre',
                use: [
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                ],
            },
        ],
    };

    const backendLocales = JSON.parse(JSON.stringify(options.parameters.environment_config.available_locales));
    const locales = JSON.parse(JSON.stringify(options.parameters.environment_config.available_locales));

    if (backendLocales.indexOf('en') !== -1) {
        backendLocales[backendLocales.indexOf('en')] = 'en-gb';
    }
    /**
     * Plugins
     * Reference: https://webpack.js.org/configuration/plugins/
     * List: https://webpack.js.org/plugins/
     */
    config.plugins = [
        new webpack.EnvironmentPlugin(['WEBPACK_PUBLIC_PATH']),
        /**
         * Used for CSS files to extract from JavaScript
         * Reference: https://github.com/webpack-contrib/mini-css-extract-plugin
         */
        new MiniCssExtractPlugin(
            {
                filename: BUILD ? '[name].css?[contenthash]' : '[name].bundle.css',
                chunkFilename: BUILD ? '[id].css?[contenthash]' : '[id].css',
            },
        ),

        /**
         * Webpack plugin that emits a json file with assets paths - used by the bundle
         * Reference: https://github.com/kossnocorp/assets-webpack-plugin
         */
        new AssetsPlugin({
            filename: path.basename(options.manifest_path),
            path: path.dirname(options.manifest_path),
        }),

        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            'window.$': 'jquery',
            moment: 'moment',
        }),
        new webpack.ContextReplacementPlugin(
            /moment[/\\]locale$/,
            new RegExp(backendLocales.join('|')),
        ),
        new webpack.ContextReplacementPlugin(
            /angular-i18n/,
            new RegExp(`angular-locale_(${backendLocales.join('|')})\.js$`),
        ),
        new webpack.ContextReplacementPlugin(
            /select2[/\\]dist[/\\]js[/\\]i18n/,
            new RegExp(`(${locales.join('|')})\.js$`),
        ),
        new webpack.DefinePlugin(
            configMaker(options),
        ),
        new webpack.IgnorePlugin({ resourceRegExp: /vertx/ }),
        new WebpackPwaManifest({
            filename: '../manifest.json',
            inject: true,
            name: 'Paysera Tickets',
            short_name: 'Paysera Tickets',
            background_color: '#f2f2f2',
            theme_color: '#FF7626',
            orientation: 'portrait',
            display: 'standalone',
            start_url: '/',
            icons: [
                {
                    src: path.resolve('app/Resources/assets/images/icon-512x512.png'),
                    sizes: [96, 128, 192, 256, 384, 512],
                },
            ],
        }),
        new CKEditorWebpackPlugin({
            language: 'en',
        }),
        new ImageMinimizerPlugin({
            minimizerOptions: {
                plugins: [
                    ['gifsicle'],
                    ['mozjpeg'],
                    ['pngquant'],
                    ['svgo'],
                ],
            },
        }),
    ];

    /**
     * Build specific plugins - used only in production environment
     */
    if (BUILD) {
        config.optimization = {
            minimizer: [
                new TerserPlugin({
                    sourceMap: true,
                    parallel: 1,
                    terserOptions: {
                        ecma: 5,
                    },
                    cache: `${cacheDirectory}/terser-plugin`,
                }),
                new CssMinimizerPlugin(),
            ],
        };
    }

    /**
     * Devtool - type of sourcemap to use per build type
     * Reference: https://webpack.js.org/configuration/devtool/
     */
    if (BUILD) {
        config.devtool = 'source-map';
        config.mode = 'production';
    } else {
        config.devtool = 'eval-cheap-source-map';
        config.mode = 'development';
        config.plugins.push(new BundleAnalyzerPlugin({
            analyzerMode: 'static',
        }));
    }
    return config;
};
