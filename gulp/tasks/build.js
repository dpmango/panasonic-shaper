var gulp        = require('gulp');
var runSequence = require('run-sequence');
var config      = require('../config');

// set build evnironment first and perform build() function
gulp.task('build:production', function(callback) {
  config.setEnv('production');
  config.logEnv();
  build(callback);
});

gulp.task('build:development', function(callback) {
  config.setEnv('development');
  config.logEnv();
  build(callback);
});

function build(callback) {
  runSequence(
    'clean:dist',
    'images',
    'sprite:svg',
    'sprite:png',
    'pug',
    'sass',
    'javascript',
    'copy',
    'list-pages',
    callback
  );
}
