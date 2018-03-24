'use strict'

var gulp       = require('gulp');
var browserify = require('browserify');
var babelify   = require('babelify');
var source     = require('vinyl-source-stream');
var buffer     = require('vinyl-buffer');
var sass       = require('gulp-sass');
var cssmin     = require('gulp-cssmin');
var rename     = require('gulp-rename');
var prefix     = require('gulp-autoprefixer');
var uglify     = require('gulp-uglify');
var concat     = require('gulp-concat');
var imagemin   = require('gulp-imagemin');
var sourcemaps = require('gulp-sourcemaps');

// Configure CSS tasks.
gulp.task('sass', function () {
  return gulp.src('public/sass/**/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(prefix('last 2 versions'))
    .pipe(cssmin())
    .pipe(concat('style.css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('public/build/styles'));
})

// Configure JS.
gulp.task('js', function () {
  return browserify({ entries: './public/scripts/script.js', debug: true })
    .transform("babelify", { presets: ["es2015"] })
    .bundle()
    .pipe(source('script.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./public/build/scripts'));
})

// Configure fonts.
gulp.task('fonts', function () {
  return gulp.src('public/fonts/**/*.+(eot|svg|ttf|woff|woff2)')
    .pipe(gulp.dest('public/build/fonts'));
})

// Configure image stuff.
gulp.task('images', function () {
  return gulp.src('public/img/**/*.+(png|jpg|gif|svg|ico)')
    .pipe(imagemin())
    .pipe(gulp.dest('public/build/images'));
})

// 'pug',
gulp.task('default', ['sass', 'js', 'fonts', 'images'], function () {
  gulp.watch('public/sass/**/*.scss', ['sass'])
  gulp.watch('public/scripts/**/*.js', ['js'])
  gulp.watch('public/fonts/**/*.+(eot|svg|ttf|woff|woff2)', ['fonts'])
  gulp.watch('public/img/**/*.+(png|jpg|gif|svg|ico)', ['images'])
})