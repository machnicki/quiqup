'use strict';

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    browserSync = require('browser-sync').create(),
    reload= browserSync.reload;


//these JSs will be concatenated into one file
var srcJs = [
      './public/bower_components/angular/angular.js',
      './public/bower_components/angular-bootstrap/ui-bootstrap.js',
      './public/bower_components/leaflet/dist/leaflet.js',
      './public/bower_components/angular-leaflet-directive/dist/angular-leaflet-directive.js',
      './public/bower_components/x2js/xml2json.js',
      './public/bower_components/angular-x2js/src/x2js.js',
      './public/js/*.js',
      '!./public/js/main.js',
      '!./public/js/main.min.js'
    ];

// Concatenate and mynifyJS Files
gulp.task('js', function() {
  return gulp.src(srcJs)
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./public/js/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('./public/js/'));
});

// Watch changes in source files
gulp.task('watch', function() {
  gulp.watch(srcJs, ['js']);
      //.on('change', reload);
});

gulp.task('serve', function() {
  browserSync.init({
    server: {
      baseDir: "./public/"
    }
  });
});

gulp.task('build', ['js']);

gulp.task('default', ['build', 'watch', 'serve']);