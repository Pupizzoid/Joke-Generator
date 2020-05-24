let project_folder = 'build';
let source_folder = '#src';
const ghPages = require('gh-pages');
// const pathBuild = require('path');

// function deploy(cb) {
// 	ghPages.publish(pathBuild.join(process.cwd(), './build'), cb);
// }
// exports.deploy = deploy;

let path = {
	build: {
		html: project_folder + '/',
		css: project_folder + '/css/',
		js: project_folder + '/js/',
		img: project_folder + '/img/',
		fonts: project_folder + '/fonts/'
	},
	src: {
		html: source_folder + '/*.html',
		css: source_folder + '/scss/style.scss',
		js: source_folder + '/js/*.js',
		img: source_folder + '/img/**/*.{jpg,png,svg,ico,webp}',
		fonts: source_folder + '/fonts/**/*.{woff2, woff}'
	},
	watch: {
		html: source_folder + '/*.html',
		css: source_folder + '/scss/**/*.scss',
		js: source_folder + '/js/*.js',
		img: source_folder + '/img/**/*.{jpg,png,svg,ico,webp}'
	},
	clean: './' + project_folder + '/'
}

let { src, dest } = require('gulp');
let browser_sync = require('browser-sync').create();
let gulp = require('gulp');
let del = require('del');
let scss = require('gulp-sass');
let autoprefixer = require('gulp-autoprefixer');
let clean_css = require('gulp-clean-css');
let rename = require('gulp-rename');
let uglify = require('gulp-uglify-es').default;


function browserSync(params) {
	browser_sync.init({
		server: {
			baseDir: './' + project_folder + '/'
		},
		port: 3000,
		notify: false
	})
}

function html() {
	return src(path.src.html)
		.pipe(dest(path.build.html))
		.pipe(browser_sync.stream())
}

function css() {
	return src(path.src.css)
		.pipe(scss({
			outputStyle: 'expanded'
		}))
		.pipe(autoprefixer({
			overrideBrowserList: ['last 5 versions'],
			cascade: true
		}))
		.pipe(dest(path.build.css))
		.pipe(clean_css())
		.pipe(rename({
			extname: '.min.css'
		}))
		.pipe(dest(path.build.css))
		.pipe(browser_sync.stream())
}

function js() {
	return src(path.src.js)
		.pipe(dest(path.build.js))
		.pipe(uglify())
		.pipe(rename({
			extname: '.min.js'
		}))
		.pipe(dest(path.build.js))
		.pipe(browser_sync.stream())
}

function watchFiles() {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
}

function clean() {
	return del(path.clean);
}

function fonts() {
	return src(path.src.fonts)
		.pipe(dest(path.build.fonts))
}

function image() {
	return src(path.src.img)
		.pipe(dest(path.build.img))
}

let build = gulp.series(clean, gulp.parallel(js, css, html, image, fonts));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.image = image;
exports.fonts = fonts;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;