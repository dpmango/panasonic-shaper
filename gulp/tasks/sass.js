var gulp         = require('gulp');
var util         = require('gulp-util');
var sass         = require('gulp-sass');
var sourcemaps   = require('gulp-sourcemaps');
var postcss      = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var short        = require('postcss-short');
var svginline    = require('postcss-inline-svg');
var sorting      = require('postcss-sorting');
var pseudoel     = require('postcss-pseudoelements');
var flexbugs     = require('postcss-flexbugs-fixes');
var animations   = require('postcss-animation');
var respType     = require('postcss-responsive-type');
var focus        = require('postcss-focus');
var easings      = require('postcss-easings');
var pxToViewport = require('postcss-px-to-viewport');
var cssnano      = require('cssnano');
var plumber      = require('gulp-plumber');
var config       = require('../config');

// PostCSS Processors
// short - shorthands -- https://github.com/jonathantneal/postcss-short
// svginline - work with svg -- https://github.com/TrySound/postcss-inline-svg
// animations - get animate.css keframes -- https://github.com/zhouwenbin/postcss-animation
// sorting - keeps rules in order -- https://github.com/hudochenkov/postcss-sorting
// pseudoel - adds semicollumns -- https://github.com/axa-ch/postcss-pseudoelements
// flexbugs - fix flex issues -- https://github.com/luisrudge/postcss-flexbugs-fixes
// respType - responsive type -- https://github.com/seaneking/postcss-responsive-type
// focus - adds focus to hover el -- https://github.com/postcss/postcss-focus
// easings - gets easings.net -- https://github.com/postcss/postcss-easings

var processors = [
  short(),
  svginline(),
  animations(),
  respType(),
  focus(),
  easings(),
  autoprefixer({
    browsers: ['last 5 versions'],
    remove: true, // remove outdated prefixes?
    // cascade: false
  }),
  sorting(),
  pseudoel(),
  pxToViewport({
    unitToConvert: 'px',
    viewportWidth: 1040,
    // viewportHeight: 1040, // not now used; TODO: need for different units and math for different properties
    unitPrecision: 5,
    viewportUnit: 'vh',
    fontViewportUnit: 'vh',  // vmin is more suitable.
    selectorBlackList: ['container'],
    minPixelValue: 1,
    mediaQuery: false
  }),
  flexbugs()
];

var cssNanoParams = {
  autoprefixer: false,
  reduceIdents: {
    keyframes: false
  },
  discardUnused: {
    keyframes: false
  }
}

// Sass task
gulp.task('sass', function() {
  return gulp
    .src(config.src.sass + '/*.{sass,scss}')
    .pipe(config.production ? util.noop() : sourcemaps.init())
    .pipe(plumber({
      errorHandler: config.errorHandler
    }))
    .pipe(sass({
        outputStyle: config.production ? 'compact' : 'expanded', // nested, expanded, compact, compressed
        precision: 5,
        includePaths : [config.src.sass]
    }))
    .on('error', config.errorHandler)
    .pipe(postcss(processors))
    .pipe(config.production ? util.noop() : sourcemaps.write('.'))
    .pipe(config.production ? postcss([cssnano(cssNanoParams)]) : util.noop())
    .pipe(gulp.dest(config.dest.css))
});

gulp.task('sass:watch', function() {
  gulp.watch(config.src.sass + '/**/*.{sass,scss}', ['sass']);
});
