const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const nodemon = require('gulp-nodemon');
const eslint = require('gulp-eslint');
const concat = require('gulp-concat');
const plumber = require('gulp-plumber');

// Compile SCSS into CSS
const stylesTask = (done) => {
  gulp.src('./scss/**/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('./hosted/'));

  done();
};

// Transpile client-side ES6 to ES5 through Babel
const transpileTask = (done) => {
  gulp.src(['./client/**/*.js'])
    .pipe(plumber())
    .pipe(concat('bundle.js'))
    .pipe(babel({ presets: ['@babel/preset-env', '@babel/preset-react'], }))
    .pipe(gulp.dest('./hosted/'));

  done();
};

// lint through all server-side JavaScript
const lintTask = (done) => {
  gulp.src(['./server/**/*.js'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());

  done();
};

const build = (done) => {
  gulp.parallel(stylesTask, transpileTask, lintTask);

  done();
};

// Watch all files for changes, nodemon for server changes
const watch = (done) => {
  gulp.watch('./scss/**/*.scss', gulp.series(stylesTask));
  gulp.watch('./client/**/*.js', gulp.series(transpileTask));

  done();
}

const nodemonWatch = (done) => {
  nodemon({
    script: './server/app.js',
    ignore: ['client/', 'scss/', 'node_modules/'],
    ext: 'js html css',
  });

  done();
}


// Export the build command
module.exports.build = build;

module.exports.transpile = transpileTask;

// Export a watch command that builds then watches our files
module.exports.watch = gulp.series(build, gulp.parallel(watch, nodemonWatch));
