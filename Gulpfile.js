var http = require('http');
var gulp = require('gulp');
var concat = require('gulp-concat');
var less = require('gulp-less');
var refresh = require('gulp-livereload');
var lr = require('tiny-lr');
var lrserver = lr();
var minifyCSS = require('gulp-minify-css');
var embedlr = require('gulp-embedlr');
var ecstatic = require('ecstatic');
var imagemin = require('gulp-imagemin');

var livereloadport = 35729,
    serverport = 5001;

gulp.task('scripts', function() {
    return gulp.src(['front/src/**/*.js'])
        .pipe(concat('dest.js'))
        .pipe(gulp.dest('dist/build'))
        .pipe(refresh(lrserver));
});

gulp.task('styles', function() {
    return gulp.src(['front/less/bootstrap.less'])
        .pipe(less())
        .on('error', console.log)
        .pipe(gulp.dest('front/css'))
});

gulp.task('serve', function() {
    //Set up your static fileserver, which serves files in the build dir
    http.createServer(ecstatic({ root: __dirname + '/front' })).listen(serverport);

    //Set up your livereload server
    lrserver.listen(livereloadport);
});


gulp.task('html', function() {
    return gulp.src("front/*.html")
        .pipe(embedlr())
        .pipe(gulp.dest('dist/'))
        .pipe(refresh(lrserver));
});

gulp.task('assets', function() {
    return gulp.src("front/assets/**")
        .pipe(imagemin({optimizationLevel: 5}))
        .pipe(gulp.dest('dist/assets/'))
        .pipe(refresh(lrserver));
});

// Requires gulp >=v3.5.0
gulp.task('watch', function () {
    gulp.watch('front/less/**/*.less', ['styles']);
});

gulp.task('default', ['scripts', 'styles', 'html', 'assets', 'serve', 'watch']);