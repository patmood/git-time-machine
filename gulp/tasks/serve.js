var gulp       = require('gulp');
var nodemon    = require('gulp-nodemon');

gulp.task('serve', ['build'], function () {
  nodemon({ script: 'server.js' })
});
