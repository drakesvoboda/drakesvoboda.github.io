var path = require("path");
var gulp = require("gulp");
var config = require("../../project.config");

gulp.task('build:assets', 'Copy Assets folder to build folder', function () {
  return gulp.src([path.join(config.srcFullPath, config.assets, "**/*")], { base: path.join(config.srcFullPath, config.assets) })
    .pipe(gulp.dest(path.join(config.destFullPath, config.assets)));
});

gulp.task(
  "watch:assets",
  "Perform assets copy when sources change",
  ["build:assets"],
  function() {
    gulp.watch(path.join(config.assets, "**/*"), { cwd: config.srcFullPath }, [
      "build:js"
    ]);
  }
);
