require('dotenv').config({silent: true});

var path = require('path');
var gulp = require('gulp');
var serial = require('run-sequence');
var del = require('del');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var replace = require('gulp-replace-task');
var cdnify = require('gulp-cdnify');
var imagemin = require('gulp-imagemin');
var browserSync = require('browser-sync').create();
var notify = require('gulp-notify');
var s3 = require('gulp-s3-upload')();
var zip = require('gulp-zip');

// Clean files out of the `build` directory
gulp.task('clean', () => {
  return del([
    'build/**/*',
  ]);
});

// Process SCSS files for development
//   - autoprefix
//   - create sourcemaps
//   - pipe to Browsersync
gulp.task('sass:dev', () => {
  return gulp
    .src('scss/styles.scss')
    .pipe(sourcemaps.init())
    .on('error', notifyError('Error running sass task [sourcemaps]'))
    .pipe(sass({outputStyle: 'expanded'}))
    .on('error', notifyError('Error running sass task [sass]'))
    .pipe(autoprefixer({browsers: ['> 1%', 'last 2 versions'], cascade: false}))
    .on('error', notifyError('Error running sass task [autoprefixer]'))
    .pipe(sourcemaps.write())
    .on('error', notifyError('Error running sass task [sourcemaps]'))
    .pipe(gulp.dest('build/css'))
    .on('error', notifyError('Error running sass task [dest]'))
    .pipe(browserSync.stream());
});

// Process SCSS files for production
//   - autoprefix
//   - minify
gulp.task('sass:prod', () => {
  return gulp
    .src('scss/styles.scss')
    .pipe(sass())
    .on('error', notifyError('Error running sass task [sass]'))
    .pipe(autoprefixer({browsers: ['> 1%', 'last 2 versions'], cascade: false}))
    .on('error', notifyError('Error running sass task [autoprefixer]'))
    .pipe(cleanCSS())
    .on('error', notifyError('Error running sass task [cleanCSS]'))
    .pipe(gulp.dest('build/css'))
    .on('error', notifyError('Error running sass task [dest]'));
});

// Process additional CSS files
//   - copy
gulp.task('css', () => {
  return gulp
    .src('css/*')
    .pipe(gulp.dest('build/css'))
    .on('error', notifyError('Error running css task [dest]'));
});

// Process font files
//   - copy
gulp.task('fonts', () => {
  return gulp
    .src('fonts/**/*.{css,otf,eot,svg,ttf,woff,woff2}')
    .pipe(gulp.dest('build/fonts'))
    .on('error', notifyError('Error running css task [dest]'));
});

// Process vendor javascript files
//   - concat
//   - pipe to Browsersync
// NOTE: This does not uglify/minify vendor scripts. Use production-ready vendor scripts.
gulp.task('vendorscripts', () => {
  return gulp
    .src('js/vendor/*.js')
    .pipe(concat('vendor.js'))
    .on('error', notifyError('Error running vendorscripts task [concat]'))
    .pipe(gulp.dest('build/js/'))
    .on('error', notifyError('Error running vendorscripts task [dest]'))
    .pipe(browserSync.stream());
});

// Process application script for development
//   - copy
//   - pipe to Browsersync
gulp.task('js:dev', () => {
  return gulp
    .src('js/scripts.js')
    .pipe(gulp.dest('build/js/'))
    .on('error', notifyError('Error running js task [dest]'))
    .pipe(browserSync.stream());
});

// Process application script for production
//   - uglify
gulp.task('js:prod', () => {
  return gulp
    .src('js/scripts.js')
    .pipe(uglify())
    .on('error', notifyError('Error running js task [uglify]'))
    .pipe(gulp.dest('build/js/'))
    .on('error', notifyError('Error running js task [dest]'));
});

// Process images
//   - imagemin
gulp.task('images', () => {
  return gulp
    .src('images/*')
    .pipe(imagemin())
    .on('error', notifyError('Error running images task [imagemin]'))
    .pipe(gulp.dest('build/images'))
    .on('error', notifyError('Error running images task [dest]'));
});

// Process HTML file for development
//   - copy
gulp.task('html:dev', () => {
  return gulp
    .src('index.html')
    .pipe(gulp.dest('build/'))
    .on('error', notifyError('Error running html task [dest]'));
});

// Process HTML file for production
//   - find/replace
//   - cdnify
gulp.task('html:prod', () => {
  if (!process.env.S3_CDN_URL) return notifyError('Error running html task')(Error('S3_CDN_PATH is not declared.'));

  return gulp
    .src('index.html')
    .pipe(replace({
      patterns: replacePatterns,
      usePrefix: false,
    }))
    .on('error', notifyError('Error running html task [replace]'))
    .pipe(cdnify({
      base: process.env.S3_CDN_URL,
    }))
    .on('error', notifyError('Error running html task [cdnify]'))
    .pipe(gulp.dest('build/'))
    .on('error', notifyError('Error running html task [dest]'));
});

// Create ZIP archive for handoff
gulp.task('zip', () => {
  return gulp
    .src(
      ['**/*', '!.git/**', '!build/**', '!node_modules/**'],
      {base: './', dot: true, nodir: true}
    )
    .pipe(zip('archive.zip'))
    .on('error', notifyError('Error running zip task [zip]'))
    .pipe(gulp.dest('./'))
    .on('error', notifyError('Error running zip task [dest]'))
});

// Serve files during development w/Browsersync
gulp.task('browser-sync', () => {
  browserSync.init({
    server: {
      baseDir: './build',
    }
  });

  gulp.watch(['scss/*.scss', 'scss/**/*.scss'], ['sass:dev']);
  gulp.watch('js/vendor/*.js', ['vendorscripts']);
  gulp.watch('js/scripts.js', ['js:dev']);
  gulp.watch('images/*', ['images']);
  gulp.watch('css/*', ['css']);
  gulp.watch('fonts/*', ['fonts']);
  gulp.watch('index.html', ['html:dev']).on('change', browserSync.reload);
})

// Deploy to S3 after successful production build
gulp.task('s3', () => {
  if (!process.env.AWS_ACCESS_KEY_ID) return notifyError('Error running html task')(Error('AWS_ACCESS_KEY_ID is not declared.'));
  if (!process.env.AWS_SECRET_ACCESS_KEY) return notifyError('Error running html task')(Error('AWS_SECRET_ACCESS_KEY is not declared.'));
  if (!process.env.S3_BUCKET) return notifyError('Error running html task')(Error('S3_BUCKET is not declared.'));
  if (typeof process.env.S3_BUCKET_PATH === 'undefined') return notifyError('Error running html task')(Error('S3_BUCKET_PATH is not declared.'));

  return gulp
    .src(['build/**/*', '!build/index.html'])
    .pipe(s3({
      Bucket: process.env.S3_BUCKET,
      ACL: 'public-read',
      keyTransform: filename => (path.join(process.env.S3_BUCKET_PATH, filename)),
    }))
    .on('error', notifyError('Error running s3 task [s3]'));
});

// Run clean then serve
gulp.task('default', cb => serial('clean', 'serve', cb));

// Compile and serve
gulp.task('serve', ['build:dev', 'browser-sync']);

// Compile files for development
gulp.task('build:dev', ['sass:dev', 'css', 'vendorscripts', 'js:dev', 'images', 'fonts', 'html:dev']);

// Compile files for production
gulp.task('build:prod', ['sass:prod', 'css', 'vendorscripts', 'js:prod', 'images', 'fonts', 'html:prod']);

// Deploy!!!
gulp.task('deploy', cb => serial('clean', 'build:prod', 's3', cb));

// Utility function to notify on error
function notifyError(title) {
  return notify.onError({
    message: 'Error: <%= error.message %>',
    title: title,
  });
}

// Array of replace patterns
var replacePatterns = [
	{
		'match':'inputEmail',
		'replacement':'asset_2'
	},
	{
		'match':'inputPhone',
		'replacement':'asset_4'
	},
	{
		'match':'inputFName',
		'replacement':'asset_7'
	},
	{
		'match':'inputLName',
		'replacement':'asset_8'
	},
	{
		'match':'inputAddress',
		'replacement':'asset_11'
	},
	{
		'match':'inputAddress2',
		'replacement':'asset_12'
	},
	{
		'match':'inputAddress3',
		'replacement':'asset_13'
	},
	{
		'match':'inputCity',
		'replacement':'asset_14'
	},
	{
		'match':'inputStProvince',
		'replacement':'asset_15'
	},
	{
		'match':'inputZip',
		'replacement':'asset_16'
	},
	{
		'match':'inputCountry',
		'replacement':'asset_17'
	},
	{
		'match':'inputBirthdate',
		'replacement':'asset_18'
	},
	{
		'match':'inputGender',
		'replacement':'asset_19'
	},
	{
		'match':'inputCompanyName',
		'replacement':'asset_20'
	},
	{
		'match':'inputMobilePhone',
		'replacement':'asset_21'
	},
	{
		'match':'inputTitle',
		'replacement':'asset_24'
	},
	{
		'match':'inputWorkPhone',
		'replacement':'asset_25'
	},
	{
		'match':'inputFax',
		'replacement':'asset_26'
	},
	{
		'match':'inputWorkFax',
		'replacement':'asset_27'
	},
	{
		'match':'inputComment',
		'replacement':'asset_42'
	}
]
