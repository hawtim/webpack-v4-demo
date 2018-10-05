const path = require('path')
const webpack = require('webpack')
const UglifyPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
    entry: {
        foo: './src/foo.js',
        bar: './src/bar.js',
        vendor: ["vue", "lodash", "vuex", "vue-router"], // 指定公共使用的第三方类库
    },
    // optimization: {
    //     runtimeChunk: {
    //         name: "manifest"
    //     },
    //     splitChunks: {
    //         cacheGroups: {
    //             commons: {
    //                 test: /[\\/]node_modules[\\/]/,
    //                 name: "vendor",
    //                 chunks: "all"
    //             }
    //         }
    //     }
    // },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    chunks: "initial",
                    test: "vendor",
                    name: "vendor", // 使用 vendor 入口作为公共部分
                    enforce: true,
                },
            },
        },
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app.js',
    },

    module: {
        rules: [{
                test: /\.jsx?/,
                include: [
                    path.resolve(__dirname, 'src')
                ],
                use: 'babel-loader',
            },
            {
                test: /\.css/,
                include: [
                    path.resolve(__dirname, 'src'),
                ],
                // 如果没有使用 ExtractTextPlugin 的话，那么 CSS 代码会转变为 JS，和 index.js 一起打包了
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /\.css$/,
                include: [
                    path.resolve(__dirname, 'src'),
                ],
                // 因为这个插件需要干涉模块转换的内容，所以需要使用它对应的 loader
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader',
                }),
            },
            {
                // 提供预处理器支持
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader',
                        'sass-loader',
                    ],
                }),
            },
            {
                // 图片压缩
                test: /.*\.(gif|png|jpe?g|svg|webp)$/i,
                use: [{
                        loader: 'file-loader',
                        options: {}
                    },
                    // 使用 DataURL
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192, // 单位是 Byte，当文件小于 8KB 时作为 DataURL 处理
                        },
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            mozjpeg: { // 压缩 jpeg 的配置
                                progressive: true,
                                quality: 65
                            },
                            optipng: { // 使用 imagemin-optipng 压缩 png，enable: false 为关闭
                                enabled: false,
                            },
                            pngquant: { // 使用 imagemin-pngquant 压缩 png
                                quality: '65-90',
                                speed: 4
                            },
                            gifsicle: { // 压缩 gif 的配置
                                interlaced: false,
                            },
                            webp: { // 开启 webp，会把 jpg 和 png 图片压缩为 webp 格式
                                quality: 75
                            },
                        },
                    }
                ]
            },
        ]
    },
    // 代码模块路径解析的配置
    resolve: {
        modules: [
            "node_modules",
            path.resolve(__dirname, 'src')
        ],

        extensions: [".wasm", ".mjs", ".js", ".json", ".jsx"],
    },
    optimization: {
        namedModules: true
    },

    devServer: {
        hot: true // dev server 的配置要启动 hot，或者在命令行中带参数开启
    },
    plugins: [
        // 使用 uglifyjs-webpack-plugin 来压缩 JS 代码
        // 如果你留意了我们一开始直接使用 webpack 构建的结果，你会发现默认已经使用了 JS 代码压缩的插件
        // 这其实也是我们命令中的 --mode production 的效果
        new UglifyPlugin(),
        // 实际项目中， 默认创建的 HTML 文件并没有什么用， 我们需要自己来写 HTML 文件， 可以通过 html - webpack - plugin 的配置， 传递一个写好的 HTML 模板
        new HtmlWebpackPlugin({
            filename: 'index.html', // 配置输出文件名和路径
            template: 'index.html', // 配置文件模板
            // 使用 minify 字段配置就可以使用 HTML 压缩，这个插件是使用 html-minifier 来实现 HTML 代码压缩的
            minify: { // 压缩 HTML 的配置
                minifyCSS: true, // 压缩 HTML 中出现的 CSS 代码
                minifyJS: true // 压缩 HTML 中出现的 JS 代码
            }
        }),
        // 引入插件，配置文件名，这里同样可以使用 [hash]
        new ExtractTextPlugin('[name].css'),
        new webpack.NamedModulesPlugin(), // 用于启动 HMR 时可以显示模块的相对路径
        new webpack.HotModuleReplacementPlugin(), // Hot Module Replacement 的插件
    ],

}
