var gulp = require('gulp');
var jasmine = require('gulp-jasmine');
var istanbul = require('gulp-istanbul');

gulp.task('test', function (done) {
    gulp.src('index.js')
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
        .on('finish', function () {
                gulp.src('test/*.js')
                    .pipe(jasmine())
                    .pipe(istanbul.writeReports({
                              dir: './coverage'
                          }))
                    .on('end', done);
            });
});

gulp.task('tdd', function(){
   gulp.watch(['index.js', 'test/*.js'], ['test']);
});