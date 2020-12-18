
const merge = require('webpack-merge');
const common = require("./webpack.common");

module.exports = merge(common, {
  mode: 'development',
  cache: true,
  devtool: 'inline-source-map'
});
