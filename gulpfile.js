var gulp     = require('gulp');
var jasmine  = require('gulp-jasmine');
var istanbul = require('gulp-istanbul');

function errorHandler(err){
    console.log(err);
    this.emit('end');
}
errorHandler.bind(gulp);

gulp.task('test', function (done) {
    gulp.src('index.js')
        .pipe(istanbul())
        //.pipe(istanbul.hookRequire())
        .on('finish', function () {
                gulp.src('test/*.js')
                    .pipe(jasmine())
                    .on('error', errorHandler)
                    .pipe(istanbul.writeReports({
                              dir : './coverage'
                          }))
                    .on('error', errorHandler)
                    .on('end', done);
            });
});

gulp.task('tdd', function () {
    gulp.watch(['index.js', 'test/*.js'], ['test']);
});