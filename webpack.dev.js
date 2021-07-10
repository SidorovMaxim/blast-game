const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');


module.exports = merge(common, {
  devServer: {
    contentBase: './build',
    compress: true,
    host: '0.0.0.0',
    port: 3000
  },
  mode: 'development'
});