const gulp = require('gulp'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  cleanCSS = require('gulp-clean-css'),
  uglify = require('gulp-uglify'),
  sourcemaps = require('gulp-sourcemaps'),
  pump = require('pump'),
  babel = require('gulp-babel')
  del = require('del'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  babelify = require('babelify')

const isProduction = process.env.NODE_ENV === 'production'

const dirs = {
  src: './src/', // 编译前资源目录
  dest: './dist/static' // 编译输出目录
}

const sassPaths = {
  // scss 文件配置
  src: `${dirs.src}/scss/*.scss`,
  base: `${dirs.src}/scss/`,
  dest: `${dirs.dest}/css/main/`
}

const jsPaths = {
  // js 文件配置
  src: `${dirs.src}/js/`,
  dest: `${dirs.dest}/js/`
}

// 编译scss
gulp.task('scss', () => {
  // scss 编译任务
  return (
    gulp
      .src(sassPaths.src)
      .pipe(sourcemaps.init())
      .pipe(
        sass({
          style: 'expanded'
        }).on('error', sass.logError)
      )
      .pipe(
        autoprefixer({ browsers: ['> 1%', 'last 2 versions', 'Firefox ESR'] })
      )
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(sassPaths.dest))
  )
})

// 编译主js文件
gulp.task('main', function() {
  // js编译的任务 main 公共文件处理
  var b = browserify({
    entries: jsPaths.src + '/main/main.js',
    debug: false
  })
  return (
    b
      .transform('babelify', {
        presets: ['env']
      })
      .bundle()
      .pipe(source('main.min.js'))
      .pipe(buffer())
      // .pipe(uglify()) // 压缩
      .pipe(gulp.dest(jsPaths.dest))
  ) // 输出目录
})

// 编译单js文件
gulp.task('js', function() {
  // js编译的任务 单一文件处理
  return gulp
    .src(jsPaths.src + '*.js')
    .pipe(babel({
        // presets: ['@babel/env'].map(require.resolve),
        // plugins: ['babel-plugin-transform-runtime'].map(require.resolve)
        presets: ['env'],
        plugins: ['transform-runtime']
      })) // es6转码
    .pipe(gulp.dest(jsPaths.dest)) // 输出目录
})

// 清理dist目录
gulp.task('clean', function() {
  return del([dirs.dest])
})

// 定义监听任务
gulp.task('watch', function() {
  gulp.watch(
    [
      sassPaths.src,
      sassPaths.base + 'modules/*.scss',
      jsPaths.src + '*.js',
      jsPaths.src + 'main/*.js',
      jsPaths.src + 'main/utils/*.js'
    ],
    gulpsync.sync(['scss', 'js', 'main'])
  )
})

gulp.task('default', () => {
  gulp.start('scss')
  console.log('任务执行……')
})
