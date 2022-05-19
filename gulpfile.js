/* global require */

const gulp = require('gulp')
const sass = require('gulp-sass')
const cleanCSS = require('gulp-clean-css')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const babel = require('gulp-babel')
const rename = require('gulp-rename')
const pump = require('pump')
const sourcemaps = require('gulp-sourcemaps')

// where to build public app files
const DIR_JS_BUILD = 'public/build/js'
const DIR_CSS_BUILD = 'public/build/css'

// order matters!
const jsAppFiles = [
  'assets/js/app/init.js',
  'assets/js/app/dom.js',
  'assets/js/app/helper.js',
  'assets/js/app/fx.js',
  'assets/js/app/modal.js',
  'assets/js/app/talkify.js',
  'assets/js/app/main.js'
]
const jsVendorFiles = [ 'assets/js/vendor/*.js' ]
const scssAppFiles = [ 'assets/scss/*.scss' ]

// error function
const onError = function (err) {
  console.error(err.toString())

  this.emit('end')
}

// sub-tasks
gulp.task('sub_jscompress-app', function (cb) {
  pump([
    gulp.src(jsAppFiles),
    concat('all-app.js', {newLine: '\r\n'}),
    gulp.dest(DIR_JS_BUILD),
    babel(
      { presets: [[ '@babel/preset-env' ]] }
    ),
    rename('all-app.min.js'),
    uglify(),
    gulp.dest(DIR_JS_BUILD)
  ], cb)
})
gulp.task('sub_jscompress-lib', function (cb) {
  pump([
    gulp.src(jsVendorFiles),
    concat('all-lib.js', {newLine: '\r\n'}),
    gulp.dest(DIR_JS_BUILD),
    babel(
      { presets: [[ '@babel/preset-env' ]] }
    ),
    rename('all-lib.min.js'),
    uglify(),
    gulp.dest(DIR_JS_BUILD)
  ], cb)
})
gulp.task('sub_compile-sass', function (cb) {
  pump([
    gulp.src(scssAppFiles),
    sourcemaps.init(),
    sass(),
    cleanCSS(),
    sourcemaps.write('./'),
    gulp.dest(DIR_CSS_BUILD)
  ], cb)
})
gulp.task('sub_clean-css', function (cb) {
  pump([
    gulp.src(DIR_CSS_BUILD),
    cleanCSS(),
    gulp.dest(DIR_CSS_BUILD)
  ], cb)
})

gulp.task('watch-files', function () {
  gulp.watch(jsAppFiles,
    gulp.series(
      'sub_jscompress-app',
      'sub_jscompress-lib'
    )
  )
  gulp.watch(scssAppFiles,
    gulp.series(
      'sub_compile-sass'
    )
  )
})
gulp.task('build',
  gulp.series(
    gulp.parallel(
      'sub_jscompress-app',
      'sub_jscompress-lib',
      'sub_compile-sass'
    )
  ),
  function (cb) {
    pump([
      gulp.src('/'),
      gulp.on('error', onError)
    ], cb)
  }
)
gulp.task('watch',
  gulp.series(
    'build',
    'watch-files'
  )
)

// set default task
gulp.task('default', gulp.series('build'))
