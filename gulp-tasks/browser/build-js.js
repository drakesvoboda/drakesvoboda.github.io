var path = require("path");

var gulp = require("gulp"),
  _ = require("lodash"),
  gutil = require("gulp-util"),
  webpack = require("webpack");

var config_prod = require("../../webpack.prod");
var config_dev = require("../../webpack.dev");
var config_froala = require("../../webpack.froala");
var config = require("../../project.config");

function buildJS(webpack_config) {
  return function (callback) {
    var webpackConf = _.cloneDeep(webpack_config);

    webpack(webpackConf, function (err, stats) {
      if (err) {
        throw new gutil.PluginError("build:js", err);
      }
      gutil.log(
        "[build:js]",
        stats.toString({
          colors: true
        })
      );
      callback();
    });
  }
}

gulp.task("build:js", "Build JS", buildJS(config_dev));

gulp.task("build:js:froala", "Build JS", buildJS(config_froala));

gulp.task("build:js:prod", "Build JS for production", buildJS(config_prod));

gulp.task(
  "watch:js",
  "Perform js build when sources change",
  ["build:js", "build:js:prod"],
  function () {
    gulp.watch(path.join(config.js, "**/*"), { cwd: config.srcFullPath }, [
      "build:js", "build:js:prod"
    ]);
  }
);
