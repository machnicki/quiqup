'use strict';

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minify = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    browserSync = require('browser-sync').create(),
    reload= browserSync.reload;


//these JSs will be concatenated into one file
var srcJs = [
      './public/bower_components/angular/angular.js',
      './public/bower_components/lodash/lodash.js',
      './public/bower_components/leaflet/dist/leaflet.js',
      './public/bower_components/angular-leaflet-directive/dist/angular-leaflet-directive.js',
      './public/bower_components/x2js/xml2json.js',
      './public/bower_components/angular-x2js/src/x2js.js',
      './public/js/*.js',
      '!./public/js/main.js',
      '!./public/js/main.min.js'
    ];

//these CSSs will be concatenated into one file
var srcCss = [
  './public/bower_components/bootstrap/dist/css/bootstrap.css',
  './public/bower_components/leaflet/dist/leaflet.css',
  '!./public/css/main.css',
  '!./public/css/main.min.css'
];

// Concatenate and mynify JS Files
gulp.task('js', function() {
  return gulp.src(srcJs)
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./public/js/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('./public/js/'));
});


// Concatenate and mynify CSS Files
gulp.task('css', function() {
  return gulp.src(srcCss)
    .pipe(concat('main.css'))
    .pipe(gulp.dest('./public/css/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minify())
    .pipe(gulp.dest('./public/css/'));
});

// Watch changes in source files
gulp.task('watch', function() {
  gulp.watch(srcJs, ['js']);

  gulp.watch(srcCss, ['css']);
});

gulp.task('serve', function() {
  browserSync.init({
    server: {
      baseDir: "./public/"
    }
  });
});

gulp.task('build', ['css', 'js']);

gulp.task('default', ['build', 'watch', 'serve']);