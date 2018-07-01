const gulp = require('gulp');
const critical = require('critical');

gulp.task('critical', (cb) => {
  critical.generate({
    base: './',
    src: 'restaurant.html',
    dest: 'css/critical-restaurant.css',
    width: 500,
    height: 1000
  });
});
