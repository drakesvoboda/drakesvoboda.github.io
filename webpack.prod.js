const merge = require('webpack-merge');
const common = require("./webpack.common");
const path = require("path");

module.exports = merge(common, {
  mode: 'production',
  output: {
    filename: "[name].prod.js",
    chunkFilename: "[id].prod.js"
  },
});
