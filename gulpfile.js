/* global require */

const gulp = require('gulp')

const sass = require('gulp-sass')
const cleanCSS = require('gulp-clean-css')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const babel = require('gulp-babel')
const rename = require('gulp-rename')
const notify = require('gulp-notify')
const pump = require('pump')

const DIR_CSS_BUILD = 'public/build/css'
const DIR_JS_BUILD = 'public/build/js'

const scssAppFiles = [ 'assets/css/app.scss' ]
const jsAppFiles = [
  'assets/js/app/init.js',
  'assets/js/app/helper.js',
  'assets/js/app/fx.js',
  'assets/js/app/main.js'
]
const jsLibFiles = [ 'assets/js/lib/*.js' ]

const onError = function (err) {
  notify({
    title: 'Gulp Task Error',
    message: 'Check the console.',
    emitError: true
  }).write(err)

  console.log(err.toString())

  this.emit('end')
}

gulp.task('jscompress-app', function (cb) {
  pump([
    gulp.src(jsAppFiles),
    concat('all-app.js', {newLine: '\r\n'}),
    gulp.dest(DIR_JS_BUILD),
    babel(
      { presets: [[ 'env' ]] }
    ),
    rename('all-app.min.js'),
    uglify(),
    gulp.dest(DIR_JS_BUILD),
    notify({
      title: 'JS Concat/Uglify (App)',
      message: 'JS Concat/Uglify (App) Passed'
    })
  ], cb)
})
gulp.task('jscompress-lib', function (cb) {
  pump([
    gulp.src(jsLibFiles),
    concat('all-lib.js', {newLine: '\r\n'}),
    gulp.dest(DIR_JS_BUILD),
    babel(
      { presets: [[ 'env' ]] }
    ),
    rename('all-lib.min.js'),
    uglify(),
    gulp.dest(DIR_JS_BUILD),
    notify({
      title: 'JS Compress (Lib)',
      message: 'JS Compress (Lib) Passed'
    })
  ], cb)
})

gulp.task('sass-compile', function (cb) {
  pump([
    gulp.src(scssAppFiles),
    sass(),
    concat('app.css'),
    cleanCSS(),
    gulp.dest(DIR_CSS_BUILD),
    notify({
      title: 'SASS',
      message: 'SASS Compiled'
    })
  ], cb)
})

gulp.task('css-clean', function (cb) {
  pump([
    gulp.src(DIR_CSS_BUILD),
    cleanCSS(),
    gulp.dest(DIR_CSS_BUILD),
    notify({
      title: 'CSS',
      message: 'CSS Minified'
    })
  ], cb)
})

gulp.task('watch-files', function () {
  gulp.watch(jsAppFiles,
    gulp.series(
      'jscompress-app',
      'jscompress-lib'
    )
  )
  gulp.watch(scssAppFiles,
    gulp.series(
      'sass-compile'
    )
  )
})
gulp.task('build',
  gulp.series(
    gulp.parallel(
      'jscompress-app',
      'jscompress-lib',
      'sass-compile'
    )
  ), function (cb) {
    pump([
      gulp.src('/'),
      gulp.on('error', onError),
      notify({
        title: 'Task Builder',
        message: 'app built successfully'
      })
    ], cb)
  }
)
gulp.task('watch',
  gulp.series(
    'build',
    'watch-files'
  )
)

gulp.task('default', gulp.series('build'))
