var gulp = require('gulp');
var ts = require('gulp-typescript');

gulp.task('default', function () {
  return gulp.src('src/**/*.ts')
    .pipe(ts({
      noImplicitAny: true,
      out: 'output.js'
    }))
    .pipe(gulp.dest('built/js'));
});
