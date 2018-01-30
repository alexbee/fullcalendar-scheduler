const gulp = require('gulp')
const shell = require('gulp-shell')
const eslint = require('gulp-eslint')
const tslint = require('gulp-tslint')
const tslintLib = require('tslint')

const tslintProgram = tslintLib.Linter.createProgram('./tsconfig.json')

gulp.task('lint', [
  'lint:src',
  'lint:built',
  'lint:node',
  'lint:tests',
  'lint:dts',
  'lint:example-repos'
])

gulp.task('lint:src', function() {
  return gulp.src('src/**/*.ts')
    .pipe(
      tslint({ // will use tslint.json
        formatter: 'verbose',
        program: tslintProgram // for type-checking rules
      })
    )
    .pipe(tslint.report())
})

gulp.task('lint:built', [ 'webpack' ], function() {
  return gulp.src([
    'dist/*.js',
    '!dist/*.min.js'
  ])
    .pipe(
      eslint({ // only checks that globals are properly accessed
        parserOptions: { 'ecmaVersion': 3 }, // for IE9
        envs: [ 'browser', 'commonjs', 'amd' ],
        rules: { 'no-undef': 2 }
      })
    )
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

gulp.task('lint:node', function() {
  return gulp.src([
    '*.js', // config files in root
    'tasks/**/*.js'
  ])
    .pipe(
      eslint({
        configFile: 'eslint.json',
        envs: [ 'node' ]
      })
    )
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

gulp.task('lint:tests', function() {
  return gulp.src('tests/automated/**/*.js')
    .pipe(
      eslint({
        configFile: 'eslint.json',
        envs: [ 'browser', 'jasmine', 'jquery' ],
        globals: [
          'moment',
          'pushOptions',
          'describeOptions',
          'describeTimezones',
          'describeValues',
          'initCalendar',
          'currentCalendar',
          'spyOnMethod',
          'spyCall',
          'oneCall'
        ]
      })
    )
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

// runs the definitions file through the typescript compiler with strict settings
// tho we don't do a require('typescript'), we need the tsc executable
gulp.task('lint:dts', [ 'ts-types' ], shell.task(
  './node_modules/typescript/bin/tsc' +
  ' fullcalendar/dist/fullcalendar.d.ts' + // need core's typedefs
  ' dist/scheduler.d.ts' + // the file we want to lint
  ' --noImplicitAny --strictNullChecks'
))

// try to build example repos
gulp.task('lint:example-repos', [ 'webpack', 'ts-types' ], shell.task(
  './bin/build-typescript-example.sh'
))
