const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const nodemon = require('gulp-nodemon');
const eslint = require('gulp-eslint');
const concat = require('gulp-concat');

const sassTask = (done) => {
  gulp.src('./scss/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./hosted/'));

  done();
};

const bundleTask = (done) => {
  gulp.src(['./client/*.js'])
    .pipe(concat('bundle.js'))
    .pipe(babel({
      presets: ['@babel/preset-env', '@babel/preset-react'],
    }))
    .pipe(gulp.dest('./hosted/'));

  done();
};

const lintTask = (done) => {
  gulp.src(['./server/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());

  done();
};

const watch = () => {
  gulp.watch('./scss/main.scss', sassTask);
  gulp.watch('./client/*.js', bundleTask);
  nodemon({
    script: './server/app.js',
    ignore: ['client/', 'scss/', 'node_modules/'],
    ext: 'js html css',
  });
};

module.exports.build = gulp.parallel(sassTask, bundleTask, lintTask);
module.exports.watch = watch;
