/**
 * Created by Mike Dvorscak on 4/11/15.
 */
var Promise         = require('promise');
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
    var build;

    function buildErrorHandler (err) {
        expect('build').toBe('successful');
        console.error(err);
    }

    beforeEach(function () {
        build = function builder(plugin){
            return new Promise(function (resolve, reject) {
                Metalsmith('test')
                    .source('fixtures')
                    .use(plugin)
                    .build(function (err) {
                               if (err) {
                                   reject(err);
                               }
                               resolve();
                           });
            });
        };
    });
    it('should launch a static server', function (done) {
        function assertions () {
            expect(bsCalledWith.server).toBeDefined();
        }

        build(plugin()).then(assertions).catch(buildErrorHandler).then(done);
    });

    it('should allow me to specify the static folder that is served', function (done) {
        function assertions () {
            expect(bsCalledWith.server).toBe('test');
        }

        build(plugin({server:'test'})).then(assertions).catch(buildErrorHandler).then(done);
    });

    it('rebuild when a watched file changes', function () {

    });

    it('should allow me to specify the watched files', function () {

    });

    it('should not attempt to launch multiple browser-sync servers (after each file change)', function () {

    });
});