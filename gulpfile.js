var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var del = require('del');
var assign = require('lodash/object/assign');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var hbsfy = require('hbsfy');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var mergeStream = require('merge-stream');
var through = require('through2');

var args = process.argv.slice(3);

gulp.task('clean', (done) => {
  del(['build'], done);
});

gulp.task('copy', ['convertGTFS'], () => {
  return mergeStream(
      gulp.src('public/imgs/**/*').pipe(gulp.dest('build/public/imgs/')),
      gulp.src([
        'node_modules/bootstrap/dist/css/bootstrap.min.css',
        'node_modules/jquery-autocomplete/jquery.autocomplete.css',
        'node_modules/font-awesome/css/font-awesome.min.css'
      ]).pipe(plugins.concat('lib.css')).pipe(plugins.csso({comments: false})).pipe(gulp.dest('build/public/css/')),
      gulp.src([
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/bootstrap/dist/js/bootstrap.min.js',
        'node_modules/jquery-autocomplete/jquery.autocomplete.js'
      ]).pipe(plugins.concat('lib.js')).pipe(plugins.uglify()).pipe(gulp.dest('build/public/js/')),
      gulp.src([
        'node_modules/bootstrap/fonts/*',
        'node_modules/font-awesome/fonts/*'
      ]).pipe(gulp.dest('build/public/fonts'))
  );
});

gulp.task('convertGTFS', () => {
  return mergeStream(
      gulp.src('public/gtfs/agency.csv').pipe(plugins.csv2json()).pipe(plugins.rename('agency.json')).pipe(plugins.jsonFormat(4)).pipe(gulp.dest('build/public/gtfs/')),
      gulp.src('public/gtfs/calendar.csv').pipe(plugins.csv2json()).pipe(plugins.rename('calendar.json')).pipe(plugins.jsonFormat(4)).pipe(gulp.dest('build/public/gtfs/')),
      gulp.src('public/gtfs/calendar_dates.csv').pipe(plugins.csv2json()).pipe(plugins.rename('calendar_dates.json')).pipe(plugins.jsonFormat(4)).pipe(gulp.dest('build/public/gtfs/')),
      gulp.src('public/gtfs/fare_attributes.csv').pipe(plugins.csv2json()).pipe(plugins.rename('fare_attributes.json')).pipe(plugins.jsonFormat(4)).pipe(gulp.dest('build/public/gtfs/')),
      gulp.src('public/gtfs/fare_rules.csv').pipe(plugins.csv2json()).pipe(plugins.rename('fare_rules.json')).pipe(plugins.jsonFormat(4)).pipe(gulp.dest('build/public/gtfs/')),
      gulp.src('public/gtfs/routes.csv').pipe(plugins.csv2json()).pipe(plugins.rename('routes.json')).pipe(plugins.jsonFormat(4)).pipe(gulp.dest('build/public/gtfs/')),
      gulp.src('public/gtfs/shapes.csv').pipe(plugins.csv2json()).pipe(plugins.rename('shapes.json')).pipe(plugins.jsonFormat(4)).pipe(gulp.dest('build/public/gtfs/')),
      gulp.src('public/gtfs/stop_times.csv').pipe(plugins.csv2json()).pipe(plugins.rename('stop_times.json')).pipe(plugins.jsonFormat(4)).pipe(gulp.dest('build/public/gtfs/')),
      gulp.src('public/gtfs/stops.csv').pipe(plugins.csv2json()).pipe(plugins.rename('stops.json')).pipe(plugins.jsonFormat(4)).pipe(gulp.dest('build/public/gtfs/')),
      gulp.src('public/gtfs/trips.csv').pipe(plugins.csv2json()).pipe(plugins.rename('trips.json')).pipe(plugins.jsonFormat(4)).pipe(gulp.dest('build/public/gtfs/'))
  )
});

gulp.task('copy-bootstrap', () => {
  return mergeStream(
      gulp.src('node_modules/bootstrap/dist/css/bootstrap.min.css')
  )
});

gulp.task('css', () => {
  return gulp.src('public/scss/*.scss')
      .pipe(plugins.sass.sync().on('error', plugins.sass.logError))
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.sass({ outputStyle: 'compressed' }))
      .pipe(plugins.autoprefixer({
        browsers: ['last 5 versions']
      }))
      .pipe(plugins.sourcemaps.write('./'))
      .pipe(gulp.dest('build/public/css/'));
});

function createBundle(src) {
  if (!src.push) {
    src = [src];
  }

  var customOpts = {
    entries: src,
    debug: true
  };
  var opts = assign({}, watchify.args, customOpts);
  var b = watchify(browserify(opts));

  b.transform(babelify.configure({
    stage: 1
  }));

  b.transform(hbsfy);
  b.on('log', plugins.util.log);
  return b;
}

function bundle(b, outputPath) {
  var splitPath = outputPath.split('/');
  var outputFile = splitPath[splitPath.length - 1];
  var outputDir = splitPath.slice(0, -1).join('/');

  return b.bundle()
      .on('error', plugins.util.log.bind(plugins.util, 'Browserify Error'))
      .pipe(source(outputFile))
      .pipe(buffer())
      .pipe(plugins.uglify())
      .pipe(plugins.sourcemaps.init({loadMaps: true}))
      .pipe(plugins.sourcemaps.write('./'))
      .pipe(gulp.dest('build/public/' + outputDir));
}

var jsBundles = {
  'js/polyfills/promise.js': createBundle('./public/js/polyfills/promise.js'),
  'js/polyfills/url.js': createBundle('./public/js/polyfills/url.js'),
  'js/main.js': createBundle('./public/js/main/index.js'),
  'serviceWorker.js': createBundle(['./public/js/serviceWorker/index.js'])
};

gulp.task('js:browser', () => {
  return mergeStream.apply(null,
      Object.keys(jsBundles).map(function(key) {
        return bundle(jsBundles[key], key);
      })
  );
});

gulp.task('js:server', () => {
  return gulp.src('server/**/*.js')
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.babel({stage: 1}))
      .pipe(plugins.uglify())
      .on('error', plugins.util.log.bind(plugins.util))
      .pipe(plugins.sourcemaps.write('.'))
      .pipe(gulp.dest('build/server'));
});

gulp.task('templates:server', () => {
  return gulp.src('templates/*.hbs')
      .pipe(plugins.handlebars())
      .on('error', plugins.util.log.bind(plugins.util))
      .pipe(through.obj(function(file, enc, callback) {
        file.defineModuleOptions.require = {Handlebars: 'handlebars/runtime'};
        callback(null, file);
      }))
      .pipe(plugins.defineModule('commonjs'))
      .pipe(plugins.rename(function(path) {
        path.extname = '.js';
      }))
      .pipe(gulp.dest('build/server/templates'));
});

gulp.task('watch', () => {
  gulp.watch(['public/scss/**/*.scss'], ['css']);
  gulp.watch(['templates/*.hbs'], ['templates:server']);
  gulp.watch(['server/**/*.js'], ['js:server']);
  gulp.watch(['public/imgs/**/*', 'public/avatars/**/*', 'server/*.txt', 'public/*.json'], ['copy']);

  Object.keys(jsBundles).forEach(function(key) {
    var b = jsBundles[key];
    b.on('update', () => {
      return bundle(b, key);
    });
  });
});

gulp.task('server', () => {
  plugins.developServer.listen({
    path: './index.js',
    cwd: './build/server',
    args: args
  });

  gulp.watch([
    'build/server/**/*.js'
  ], plugins.developServer.restart);
});

gulp.task('serve', (callback) => {
  runSequence('clean', ['css', 'js:browser', 'templates:server', 'js:server', 'copy'], ['server', 'watch'], callback);
});
