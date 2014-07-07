var gulp = require('gulp');
var uncss = require('gulp-uncss-task');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var rev = require('gulp-rev');
var ngmin = require('gulp-ngmin');
var minifyCss = require('gulp-minify-css');
var clean = require('gulp-clean');
var runSequence = require('gulp-run-sequence');

gulp.task('clean', function () {
    gulp.src('./front-build/')
        .pipe(clean({force: true}))
});

gulp.task('fonts', function () {
    return gulp.src(["./front/fonts/**/*.*"])
        .pipe(gulp.dest('./front-build/fonts/'))
});

gulp.task('views', function () {
    return gulp.src(["./front/views/**/*.*"])
        .pipe(gulp.dest('./front-build/views/'))
});

gulp.task('img', function () {
    return gulp.src(["./front/img/**/*.*"])
        .pipe(gulp.dest('./front-build/img/'))
});

gulp.task('js-css', function () {
    gulp.src('./front/index.html')
        .pipe(usemin({
            css: [
                //uncss({
                //    html: ['./front/index.html', './front/views/*.html']
                //}),
                minifyCss()
            ],
            js: [
                uglify(),
                ngmin(),
                rev()
            ]
        }))
        .pipe(gulp.dest('./front-build/'));
});

gulp.task('default', function () {
    runSequence('clean', ['fonts', 'views', 'img', 'js-css']);
});

gulp.task('watch', function () {

});