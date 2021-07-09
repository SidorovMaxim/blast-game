const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  entry: {
    main: path.resolve(__dirname, './src/scripts/main.js')
  },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: './scripts/bundle.js',
  },
  module: {
    rules: [
      { test: /\.(png|svg|jpg|jpeg|gif)$/i, type: 'asset/resource' },
      { test: /\.(woff|woff2|eot|ttf|otf)$/i, type: 'asset/resource' },
      { test: /\.svg$/, use: 'svg-inline-loader' },
      { test: /\.css$/, use: [ 'style-loader', 'css-loader' ] },
      { test: /\.(js)$/, use: 'babel-loader' }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
        template: path.resolve(__dirname, './src/template.html'),
        filename: 'index.html',
        favicon: './src/assets/icons/favicon.ico'
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, 'build'),
    compress: true,
    host: '0.0.0.0',
    port: 9000
  },
  mode: 'development'
};