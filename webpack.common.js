const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  entry: {
    main: path.resolve(__dirname, './src/scripts/main.js')
  },
  output: {
    path: path.resolve(__dirname, 'build'),
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
        title: 'Production',
        template: path.resolve(__dirname, './src/template.html'),
        filename: 'index.html',
        favicon: './src/assets/icons/favicon.ico'
    })
  ]
};