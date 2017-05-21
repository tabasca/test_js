'use strict';

const del = require('del');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const server = require('browser-sync').create();
const rename = require('gulp-rename');

const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const webpack = require('gulp-webpack');

const mocha = require('gulp-mocha'); // Добавим установленный gulp-mocha плагин
require('babel-register');   // Добавим поддержку "import/export" из ES2015

const SOURCES_DIR = 'src/';
const RESOURCES_DIR = 'public/';

gulp.task('scripts', function () {
	return gulp.src(SOURCES_DIR + 'js/*.js')
		.pipe(plumber())
		.pipe(webpack({
			devtool:'source-map',
			module: {
				loaders: [
					{ test: /\.js$/,
						loader: 'babel-loader',
						query: {
							presets: ['es2015']
						}},
				],
			},
			output:{
				filename:'main.js'
			}
		}))
		.pipe(gulp.dest(RESOURCES_DIR + 'js/'))
		.pipe(server.stream());
});

gulp.task('test', function () {
	return gulp
		.src([SOURCES_DIR + 'js/**/*.test.js'], { read: false })
		.pipe(mocha({
			compilers: {
				js: 'babel-register' // Включим поддержку "import/export" в Mocha
			},
			reporter: 'spec'       // Вид в котором я хочу отображать результаты тестирования
		}));
});

gulp.task('copy-html', function () {
	return gulp.src(SOURCES_DIR + '*.html')
		.pipe(gulp.dest(RESOURCES_DIR))
		.pipe(server.stream());
});

gulp.task('copy-css', function () {
	return gulp.src(SOURCES_DIR + 'css/*.css')
		.pipe(gulp.dest(RESOURCES_DIR + 'css/'))
		.pipe(server.stream());
});

gulp.task('copy', ['copy-html', 'copy-css', 'scripts'], function () {
	return gulp.src([
		SOURCES_DIR + 'data/**/*.json',
		'img/*.*'
	], {base: SOURCES_DIR})
		.pipe(gulp.dest(RESOURCES_DIR));
});

gulp.task('clean', function () {
	return del(RESOURCES_DIR);
});

gulp.task('serve', ['assemble'], function () {
	server.init({
		server: './' + RESOURCES_DIR,
		notify: false,
		open: true,
		port: 3501,
		ui: false
	});

	gulp.watch('*.html').on('change', (e) => {
		if (e.type !== 'deleted') {
			gulp.start('copy-html');
		}
	});

	gulp.watch(SOURCES_DIR + 'css/*.css').on('change', (e) => {
		if (e.type !== 'deleted') {
			gulp.start('copy-css');
		}
	});

	gulp.watch(SOURCES_DIR + 'js/**/*.js', ['scripts']).on('change', server.reload);
});

gulp.task('assemble', ['clean'], function () {
	gulp.start('copy');
});

gulp.task('build', ['assemble']);
