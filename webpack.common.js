var path = require("path");
var webpack = require("webpack");
var config = require("./project.config");
var ExtractTextPlugin = require('extract-text-webpack-plugin');

require("@babel/polyfill");

var sassIncl = require('sass-include-paths'),
  scssIncludePaths = [].concat(sassIncl.nodeModulesSync()).concat('src/styles');

module.exports = {
  context: config.srcFullPath,
  entry: {
    app: ["./js/App.js"]
  },
  output: {
    path: path.join(config.destFullPath, config.js),
    filename: "[name].js",
    chunkFilename: "[id].js"
  },
  module: {
    rules: [
      {
        test: /\.js$/, //Regular expression 
        exclude: /(node_modules|bower_components)/, //excluded node_modules 
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", { "useBuiltIns": "usage" }]
            ]
          }
        }
      },
      {
        test: /\.css$/, use: ExtractTextPlugin.extract({ fallback: 'style-loader', use: ['css-loader'] })
      },
      {
        test: /\.styl$/, use: ExtractTextPlugin.extract(['css-loader', 'stylus-loader'])
      },
      {
        test: /\.less$/, use: ExtractTextPlugin.extract(['css-loader', 'less-loader'])
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                minimize: true
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
                includePaths: scssIncludePaths
              }
            }
          ]
        })
      },
      { test: /\.tmpl$/, loader: "raw" },
      { test: /\.(jpe?g|gif|png|svg|woff|ttf|wav|mp3)$/, loader: "file" },
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: [
          'raw-loader',
          'glslify-loader'
        ]
      }
    ]
  },
  resolve: {
    modules: [path.join(config.srcFullPath, config.js), path.join(__dirname, "node_modules")]
  },
  plugins: [
    // Extract style references to separate file
    new ExtractTextPlugin("[name].css", {
      allChunks: true
    })
  ],
};
