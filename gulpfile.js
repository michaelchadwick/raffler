var gulp = require('gulp')

var jshint = require('gulp-jshint')
var sass = require('gulp-sass')
var concat = require('gulp-concat')
var babel = require('gulp-babel')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')
var pump = require('pump')

// JS files
var jsAppFiles = [
  'assets/js/app/init.js',
  'assets/js/app/helper.js',
  'assets/js/app/fx.js',
  'assets/js/app/main.js'
]
var jsLibFiles = [
  'assets/js/lib/*.js'
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
      gulp.src(jsAppFiles),
      jshint(),
      jshint.reporter('default')
    ],
    cb
  )
})

gulp.task('lib-lint', function (cb) {
  pump(
    [
      gulp.src(jsLibFiles),
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
      gulp.src(jsAppFiles),
      concat('all-app.js', {newLine: '\r\n'}),
      gulp.dest('assets/js/app/build'),
      babel({ presets: ['es2015'] }),
      rename('all-app.min.js'),
      uglify(),
      gulp.dest('assets/js/app/build')
    ],
    cb
  )
})
gulp.task('lib-concat-minify', function (cb) {
  pump(
    [
      gulp.src(jsLibFiles),
      concat('all-lib.js', {newLine: '\r\n'}),
      gulp.dest('assets/js/lib/build'),
      babel({ presets: ['es2015'] }),
      rename('all-lib.min.js'),
      uglify(),
      gulp.dest('assets/js/lib/build')
    ],
    cb
  )
})

// Watch Files For Changes
gulp.task('watch', function () {
  gulp.watch(jsAppFiles, ['app-lint', 'app-scripts'])
  // gulp.watch('scss/*.scss', ['sass'])
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
