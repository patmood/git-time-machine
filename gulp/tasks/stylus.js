var gulp  = require('gulp')
  , config= require('../config').stylus
  , stylus= require('gulp-stylus')

gulp.task('stylus', function() {
  console.log(config)
  gulp.src(config.entry)
    .pipe(stylus(config.options))
    .pipe(gulp.dest(config.dest))
});
