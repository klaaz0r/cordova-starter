'use strict'

const gulp = require('gulp-help')(require('gulp'))
const sass = require('gulp-sass')
const clean = require('gulp-clean')
const gutil = require('gulp-util')
const htmlmin = require('gulp-htmlmin')
const gulpif = require('gulp-if')
const cleanCSS = require('gulp-clean-css')
const purify = require('gulp-purifycss')
const runSequence = require('run-sequence')
const debug = require('gulp-debug')
const convict = require('./lib/gulp-convict')

gulp.environment = process.env.NODE_ENV ? process.env.NODE_ENV : 'develop'

const webpack = require('webpack')
const webpackStream = require('webpack-stream')

const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')

const browserSync = require('browser-sync').create()

gulp.paths = { app: 'app', styles: 'styles', dist: 'www' }

const isProd = gulp.environment !== 'develop'
const isDev = gulp.environment === 'develop'

const pkg = require('./package.json')
const dependencies = pkg.dependencies

gutil.log('build environment', gutil.colors.magenta(gulp.environment))

gulp.task('default', 'starts dev server and watching files', ['preserve'], () => {
  gulp.watch([gulp.paths.app + '/**/*.js'], ['scripts'])
})

gulp.task('build:prod', 'building production', ['clean'], (cb) => {
  runSequence('html', 'dll', 'scripts', 'styles', 'assets', cb)
})

gulp.task('preserve', 'building files', (cb) => {
  runSequence('html', 'dll', 'scripts', 'config', 'styles', 'assets', cb)
})

gulp.task('clean', 'cleaning dist/', () => {
  return gulp.src(gulp.paths.dist, { read: false })
    .pipe(clean())
})

gulp.task('scripts', 'bundle app (only used for builds)', () => {
  return webpackStream(require('./webpack.config.js')(gulp.environment), webpack)
    .pipe(debug({ title: 'scripts' }))
    .pipe(gulp.dest(gulp.paths.dist))
})

gulp.task('dll', 'making dll files (change dll.loader.js for new seperations)', (cb) => {
  let vendor = []
  for (let module in dependencies) { vendor.push(module) }
  gutil.log('vendor dependencies', gutil.colors.blue.bold(vendor))
  webpack(require('./webpack.config.dll.js')(vendor), function(err, stats) {
    if (err) { throw new gutil.PluginError('webpack', err) }
    gutil.log('[webpack dll]', stats.toString({ colors: true, chunks: false }))
    cb()
  })
})

gulp.task('html', 'minify html and move to dist', () => {
  return gulp.src(gulp.paths.app + '/*.html')
    .pipe(gulpif(isProd, htmlmin({ collapseWhitespace: true })))
    .pipe(debug({ title: 'hmtl' }))
    .pipe(gulp.dest(gulp.paths.dist))
})

gulp.task('styles', 'building custom sass', () => {
  browserSync.notify('compiling styles')
  return gulp.src(gulp.paths.styles + '/main.scss')
    .pipe(sass())
    .pipe(gulpif(isProd, purify([gulp.paths.app + '/**/*.js'])))
    .pipe(gulpif(isProd, cleanCSS({ compatibility: 'ie8' })))
    .pipe(debug({ title: 'styles' }))
    .pipe(gulp.dest(gulp.paths.dist))
    .pipe(gulpif(isDev, browserSync.stream()))
})

gulp.task('assets', 'moving assets', () => {
  gutil.log('moving semantic assets', gutil.colors.magenta(gulp.paths.semantic))
  return gulp.src(gulp.paths.semantic + '/themes/**/*.{ttf,woff,,woff2,eof,svg}')
    .pipe(gulp.dest(gulp.paths.dist + '/themes'))
    .pipe(debug({ title: 'assets' }))
    .pipe(gulpif(isDev, browserSync.stream()))
})

gulp.task('config', 'get the correct config', () => {
  return gulp.src('./config/*.js')
    .pipe(convict({ log: true, schema: __dirname + '/config/schema.js' }))
    .pipe(gulp.dest(gulp.paths.app))
})
