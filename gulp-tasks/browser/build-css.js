var path = require("path");

var gulp = require("gulp"),
  stylus = require("gulp-stylus"),
  less = require("gulp-less"),
  sass = require("gulp-sass"),
  postcss = require('gulp-postcss'),
  rename = require('gulp-rename'),
  sourcemaps = require('gulp-sourcemaps'),
  plumber = require('gulp-plumber'),
  nano = require('cssnano'),
  cssnext = require('postcss-cssnext');

var config = require("../../project.config");

var postcssConfig = [/*autoprefixer("last 1 version", "> 1%", "ie 8"),*/ nano(), cssnext()]

gulp.task("build:css:css", "Build and add vendor prefixes for plain CSS", false, function () {
  return gulp.src(path.join(config.srcFullPath, config.styles, "*.css"))
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(postcss(postcssConfig))
    .pipe(gulp.dest(path.join(config.destFullPath, "styles")));
});

gulp.task("build:css:stylus", "Build and add vendor prefixes for Stylus styles", false, function () {
  return gulp.src(path.join(config.srcFullPath, config.styles, "*.styl"))
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(stylus({
      set: ["compress"],
      define: { "ie8": true }
    }))
    .pipe(postcss(postcssConfig))
    .pipe(gulp.dest(path.join(config.destFullPath, config.styles)));
});

gulp.task("build:css:less", "Build and add vendor prefixes for LESS styles", false, function () {
  return gulp.src(path.join(config.srcFullPath, config.styles, "*.less"))
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(postcss(postcssConfig))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.join(config.destFullPath, config.styles)));
});

gulp.task("build:css:sass", "Build SASS styles with sourcemaos", false, function () {
  return gulp.src(path.join(config.srcFullPath, config.styles, "*.scss"))
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write({ includeContent: false }))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(postcss(postcssConfig))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.join(config.destFullPath, config.styles)));
});

gulp.task("build:css:sass:prod", "Build SASS styles", false, function () {
  return gulp.src(path.join(config.srcFullPath, config.styles, "*.scss"))
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(postcssConfig))
    .pipe(rename(x => x.basename += ".prod"))
    .pipe(gulp.dest(path.join(config.destFullPath, config.styles)));
});

gulp.task("build:css", "Build CSS, Stylus & LESS --> CSS", [
  "build:css:css",
  "build:css:stylus",
  "build:css:less",
  "build:css:sass"
]);

gulp.task("build:css:prod", "Build CSS, Stylus & LESS --> CSS", [
  "build:css:css",
  "build:css:stylus",
  "build:css:less",
  "build:css:sass:prod"
]);

gulp.task("watch:css", "Perform style build when sources change", ['build:css', 'build:css:sass:prod'], function () {
  gulp.watch(path.join(config.styles, "**/*.styl"), { cwd: config.srcFullPath }, ['build:css:stylus']);
  gulp.watch(path.join(config.styles, "**/*.css"), { cwd: config.srcFullPath }, ['build:css:css']);
  gulp.watch(path.join(config.styles, "**/*.less"), { cwd: config.srcFullPath }, ['build:css:less']);
  gulp.watch(path.join(config.styles, "**/*.scss"), { cwd: config.srcFullPath }, ['build:css:sass', 'build:css:sass:prod']);
});
