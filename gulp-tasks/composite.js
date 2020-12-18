var path = require("path");
var gulp = require("gulp");
var config = require("../project.config");

gulp.task("default", false, function () {
  gulp.tasks.help.fn();
});

gulp.task("build", "Copy assets, build CSS, JS, and HTML.", ['build:css', 'build:js', 'build:css:prod', 'build:js:prod', 'build:assets']);

gulp.task("build:prod", "Copy assets, build CSS, JS, and HTML.", ['build:css:prod', 'build:js:prod', 'build:assets']);

gulp.task("watch", "Perform build when sources change.", ["watch:css", "watch:js", "watch:assets"]);
