const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = (isDev = true, config = {}) => {
  return {
    devtool: isDev ? "source-map" : false,
    mode: isDev ? "development" : "production",
    module: {
      rules: [
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
              }
            },
            'css-loader',
            'sass-loader',
            'import-glob-loader'
          ]
        },
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          ]
        }
      ]
    },
    entry: {
      app: `${config.src.assets}/js/app.js`
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: '[name].js'
    },
    plugins: [
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: 'vendor.css',
        chunkFilename: '[id].css',
      })
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        name: "vendor"
      }
    }
  }
}