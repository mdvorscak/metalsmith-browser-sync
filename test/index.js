/**
 * Created by Mike Dvorscak on 4/11/15.
 */
var proxyquire      = require('proxyquire');
var Metalsmith      = require('metalsmith');
var bsCalledWith    = {};
var browserSyncMock = {
    browserSync : function (options) {
        bsCalledWith = options;
    }
};
var plugin          = proxyquire('../index.js', {'browser-sync' : browserSyncMock.browserSync});

describe('metalsmith-browser-sync', function () {
    it('should launch a static server', function (done) {
        spyOn(browserSyncMock, 'browserSync');
        Metalsmith(__dirname)
            .use(plugin)
            .build(function (err) {
                       if (err) {
                           console.error(err);
                       }
                       expect(browserSyncMock.browserSync).toHaveBeenCalled();
                       expect(bsCalledWith.server).toBeDefined();
                       done();
                   });

    });

    it('should allow me to specify the static folder that is served', function () {

    });

    it('rebuild when a watched file changes', function () {

    });

    it('should allow me to specify the watched files', function () {

    });

    it('should not attempt to launch multiple browser-sync servers (after each file change)', function () {

    });
});