var gulp = require('gulp')

var jshint = require('gulp-jshint')
var sass = require('gulp-sass')
var concat = require('gulp-concat')
var babel = require('babel-core')
var babel = require('gulp-babel')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')
var pump = require('pump')
var gutil = require('gulp-util')

// JS files
var js_app_files = [
  'js/app/init.js',
  'js/app/helper.js',
  'js/app/fx.js',
  'js/app/main.js'
]
var js_lib_files = [
  'js/lib/*.js'
]

// Compile Sass
gulp.task('sass', function () {
  return gulp.src('assets/scss/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('css'))
})

// Lint Task
gulp.task('app-lint', function (cb) {
  pump(
    [
      gulp.src(js_app_files),
      jshint(),
      jshint.reporter('default')
    ],
    cb
  )
})

gulp.task('lib-lint', function (cb) {
  pump(
    [
      gulp.src(js_lib_files),
      jshint(),
      jshint.reporter('default')
    ],
    cb
  )
})

// Concatenate & Minify JS
gulp.task('app-concat-minify', function (cb) {
  pump(
    [
      gulp.src(js_app_files),
      concat('all-app.js', {newLine: '\r\n'}),
      gulp.dest('js/app/build'),
      babel({ presets: ['es2015'] }),
      rename('all-app.min.js'),
      uglify(),
      gulp.dest('js/app/build')
    ],
    cb
  )
})
gulp.task('lib-concat-minify', function () {
  pump(
    [
      gulp.src(js_lib_files),
      concat('all-lib.js', {newLine: '\r\n'}),
      gulp.dest('js/lib/build'),
      babel({ presets: ['es2015'] }),
      rename('all-lib.min.js'),
      UglifyJS.minify(),
      gulp.dest('js/lib/build')
    ],
    cb
  )
})

// Watch Files For Changes
gulp.task('watch', function () {
  gulp.watch(js_app_files, ['app-lint', 'app-scripts'])
  //gulp.watch('scss/*.scss', ['sass'])
})

// Default Task
gulp.task('default',
  [
    'app-lint',
    'app-concat-minify'
  ]
)
gulp.task('build',
  [
    'app-lint',
    'app-concat-minify'
  ]
)
gulp.task('watch',
  [
    'app-lint',
    'app-concat-minify',
    'watch'
  ]
)
