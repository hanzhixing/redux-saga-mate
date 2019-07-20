const path = require('path');
const url = require('url');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');
const ManifestPlugin = require('webpack-manifest-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

const homepage = require(path.resolve(__dirname, 'package.json')).homepage;

const ensureSlash = (path, need) => {
    const hasSlash = path.endsWith('/');
    if (hasSlash && !need) {
        return path.slice(0, -1);
    } else if (!hasSlash && need) {
        return `${path}/`;
    } else {
        return path;
    }
};

module.exports = (cliEnv = {}, argv) => {
    console.log(cliEnv, argv);

    const {mode} = argv;

    process.env.BABEL_ENV = mode;
    process.env.NODE_ENV = mode;

    const isDev = mode === 'development';
    const isProd = mode === 'production';

    const servedUrl = cliEnv.publicUrl || (homepage ? url.parse(homepage).pathname : '/');

    const publicPath = isProd ? ensureSlash(servedUrl, true) : isDev && '/';

    const shouldUseRelativeAssetPaths = publicPath === './';

    const publicUrl = isProd ? publicPath.slice(0, -1) : isDev && '';

    const env = {
        raw: {
            ...cliEnv,
            ENV_MODE: mode,
            ENV_PUBLIC_URL: publicUrl,
        },
        stringified: {
            ...Object.keys(cliEnv).reduce((env, key) => ({...env, [key]: JSON.stringify(cliEnv[key])}), {}),
            ENV_MODE: JSON.stringify(mode),
            ENV_PUBLIC_URL: JSON.stringify(publicUrl),
        },
    };

    const getStyleLoaders = (cssOptions, preProcessor) => [
        'classnames-loader',
        isDev && 'style-loader',
        isProd && {
            loader: MiniCssExtractPlugin.loader,
            options: shouldUseRelativeAssetPaths ? { publicPath: '../../' } : undefined,
        },
        {
            loader: 'css-loader',
            options: cssOptions,
        },
        {
            loader: 'postcss-loader',
            options: {
                ident: 'postcss',
                sourceMap: isProd && true,
            },
        },
        preProcessor && {
            loader: preProcessor,
            options: {
                sourceMap: isProd &&  true,
            },
        },
    ].filter(Boolean);

    return {
        mode: isProd ? 'production' : isDev && 'development',
        // Stop compilation early in production
        bail: isProd,
        devtool: isProd ? 'source-map' : (isDev ? 'cheap-module-source-map' : false),
        devServer: {
            disableHostCheck: true,
            compress: true,
            clientLogLevel: 'none',
            contentBase: path.join(__dirname, 'public'),
            watchContentBase: true,
            hot: true,
            historyApiFallback: true,
            stats: 'minimal',
        },
        entry: {
            index: [
                'abortcontroller-polyfill/dist/polyfill-patch-fetch',
                'core-js/stable',
                'regenerator-runtime/runtime',
                path.resolve(__dirname, 'demo/src/index'),
            ],
            '404': [
                'core-js/stable',
                'regenerator-runtime/runtime',
                path.resolve(__dirname, 'demo/src/404'),
            ]
        },
        output: {
            path: isProd ? path.resolve(__dirname, 'dist/demo') : undefined,
            pathinfo: isDev,
            filename: `static/js/[name]${isProd ? '.[chunkhash]' : isDev && ''}.js`,
            chunkFilename: `static/js/[name]${isProd ? '.[chunkhash]' : isDev && ''}.chunk.js`,
            publicPath: publicPath,
            devtoolModuleFilenameTemplate: isProd
                ? info =>
                path
                .relative(path.resolve(__dirname, 'demo/src'), info.absoluteResourcePath)
                .replace(/\\/g, '/')
                : isDev &&
                (info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')),
        },
        optimization: {
            minimize: isProd,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        parse: {
                            ecma: 8,
                        },
                        compress: {
                            ecma: 5,
                            warnings: false,
                            comparisons: false,
                            inline: 2,
                        },
                        mangle: {
                            safari10: true,
                        },
                        output: {
                            ecma: 5,
                            comments: false,
                            ascii_only: true,
                        },
                    },
                    parallel: true,
                    cache: true,
                    sourceMap:  true,
                }),
                new OptimizeCSSAssetsPlugin({
                    cssProcessorOptions: {
                        parser: safePostCssParser,
                        map: true ? {inline: false, annotation: true} : false,
                    },
                }),
            ],
            splitChunks: {
                chunks: 'all',
                name: false,
            },
            runtimeChunk: true,
        },
        resolve: {
            alias: {
                // This is the patch which removes the warning below in the browser console.
                // Warning! React-Hot-Loader: react-hot-dom patch is not detected. React 16.6+ features may not work.

                'react-dom': '@hot-loader/react-dom',
                'redux-saga-mate': path.resolve(__dirname, 'src/index'),
            },
            extensions: ['.wasm', '.mjs', '.js', '.json', '.jsx'],
        },
        module: {
            strictExportPresence: true,
            rules: [
                {
                    enforce: 'pre',
                    test: /\.(js|mjs|jsx)$/,
                    loader: "eslint-loader",
                    include: [
                        path.resolve(__dirname),
                        path.resolve(__dirname, 'demo/src'),
                    ],
                    exclude: /node_modules/,
                },
                {
                    oneOf: [
                        // {
                        //     test: /\.svg$/,
                        //     loader: 'svg-inline-loader'
                        // },
                        {
                            test: /\.svg$/,
                            use: {
                                loader: 'svg-react-loader',
                            },
                        },
                        {
                            test: /\.(bmp|gif|jpe?g|png)$/,
                            // loader: 'url-loader',
                            loader: 'file-loader',
                            options: {
                                limit: 10000,
                                name: 'static/media/[name].[hash:8].[ext]',
                            },
                        },
                        {
                            test: /\.(js|mjs|jsx)$/,
                            include: [
                                path.resolve(__dirname),
                                path.resolve(__dirname, 'demo/src'),
                            ],
                            loader: 'babel-loader',
                            options: {
                                cacheDirectory: true,
                                cacheCompression: isProd,
                            },
                        },
                        {
                            test: /\.css$/,
                            exclude: /\.m\.css$/,
                            use: getStyleLoaders({
                                importLoaders: 1,
                                sourceMap: isProd && true,
                            }),
                            sideEffects: true,
                        },
                        {
                            test: /\.m\.css$/,
                            use: getStyleLoaders({
                                importLoaders: 1,
                                sourceMap: isProd &&  true,
                                modules: {
                                    localIdentName: '[path][name]__[local]--[hash:base64:5]',
                                },
                            }),
                        },
                        {
                            test: /\.scss$/,
                            exclude: /\.m\.scss$/,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 2,
                                    sourceMap: isProd &&  true,
                                },
                                'sass-loader'
                            ),
                            sideEffects: true,
                        },
                        {
                            test: /\.m\.scss$/,
                            use: getStyleLoaders(
                                {
                                    importLoaders: 2,
                                    sourceMap: isProd &&  true,
                                    modules: {
                                        localIdentName: '[path][name]__[local]--[hash:base64:5]',
                                    },
                                },
                                'sass-loader'
                            ),
                        },
                        {
                            loader: 'file-loader',
                            exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                            options: {
                                name: 'static/media/[name].[hash:8].[ext]',
                            },
                        },
                        {
                            test: /\.html$/,
                            use: [
                                {
                                    loader: 'html-loader',
                                    options: {
                                        interpolate: true,
                                        minimize: false,
                                        removeComments: false,
                                        collapseWhitespace: false
                                    },
                                },
                            ],
                        },
                        // ** STOP ** Are you adding a new loader?
                        // Make sure to add the new loader(s) before the "file" loader.
                    ],
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                title: 'Redux Saga Mate Demo',
                template: path.resolve(__dirname, 'demo/public/index.html'),
                filename: 'index.html',
                inject: 'body',
                chunks: ['index'],
            }),
            new HtmlWebpackPlugin({
                title: 'Redux Saga Mate Demo',
                template: path.resolve(__dirname, 'demo/public/404.html'),
                filename: '404.html',
                inject: 'body',
                chunks: ['404'],
            }),
            new webpack.DefinePlugin(env.stringified),
            isProd && new MiniCssExtractPlugin({
                filename: 'static/css/[name].[contenthash:8].css',
                chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
            }),
            new ManifestPlugin({
                fileName: 'assets.json',
                publicPath,
            }),
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            isProd && new BundleAnalyzerPlugin({analyzerMode: 'static', openAnalyzer: false}),
        ].filter(Boolean),
        node: {
            dgram: 'empty',
            fs: 'empty',
            net: 'empty',
            tls: 'empty',
            child_process: 'empty',
        },
        performance: {
            hints: isProd ? 'warning' : false,
        },
    };
};
