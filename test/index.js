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

var debugMessage;
var debugMock = {
    debug : function (namespace) {
        return function(message){
            debugMessage = message;
        };
    }
};
var plugin    = proxyquire('../index.js', {
    'browser-sync' : browserSyncMock.browserSync,
    'debug'        : debugMock.debug
});

describe('metalsmith-browser-sync', function () {
    var build;
    var metalsmith;

    function buildErrorHandler (err) {
        expect('build').toBe('successful');
        console.error(err);
    }

    beforeEach(function () {
        debugMessage = '';
        build = function builder (plugin) {
            return new Promise(function (resolve, reject) {
                metalsmith = Metalsmith('test')
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

    describe('options', function () {
        it('should use the build directory by default', function (done) {
            function assertions () {
                expect(bsCalledWith.server).toBe('build');
            }

            build(plugin()).then(assertions).catch(buildErrorHandler).then(done);
        });

        it('should allow me to specify the static folder that is served', function (done) {
            function assertions () {
                expect(bsCalledWith.server).toBe('test');
            }

            build(plugin({server : 'test'})).then(assertions).catch(buildErrorHandler).then(done);
        });

        it('should use default watched files, if no files are provided', function (done) {
            function assertions () {
                expect(bsCalledWith.files).toEqual(["src/**/*.md", "templates/**/*.hbs"]);
            }

            build(plugin()).then(assertions).catch(buildErrorHandler).then(done);
        });

        it('should allow me to specify the watched files', function (done) {
            function assertions () {
                expect(bsCalledWith.files).toEqual(['test/*.test']);
            }

            build(plugin({files : ['test/*.test']})).then(assertions).catch(buildErrorHandler).then(done);
        });
    });

    it('should not effect other plugins', function(){

    });

    describe('metalsmith mock tests', function(){
        var rawPlugin, metalsmithMock;
        beforeEach(function(){
            rawPlugin = plugin();
            metalsmithMock = {
                build : function(callback){
                    callback();
                },
                plugins : []
            };
        });
        it('should not attempt to launch multiple browser-sync servers (after each file change)', function (done) {
            spyOn(browserSyncMock, 'browserSync').and.callThrough();
            spyOn(metalsmithMock, 'build').and.callThrough();

            var callCount = 0;
            function simulateFileChange () {
                callCount++;
                var fnToCall = callCount > 1 ? assertions : simulateFileChange;
                bsCalledWith.middleware(null, null, fnToCall);
            }

            function assertions () {
                expect(metalsmithMock.build.calls.count()).toBe(2);
                expect(browserSyncMock.browserSync.calls.count()).toBe(1);
                done();
            }
            rawPlugin(null, metalsmithMock, simulateFileChange);
        });

        it('rebuild when a watched file changes', function (done) {

            spyOn(metalsmithMock, 'build').and.callThrough();

            function simulateFileChange () {
                bsCalledWith.middleware(null, null, assertions);
            }

            function assertions () {
                expect(debugMessage).toBe('Build successful');
                expect(metalsmithMock.build.calls.count()).toBe(1);
                done();
            }
            rawPlugin(null, metalsmithMock, simulateFileChange);
        });

        describe('debug messages', function(){
            it('should be successful if there were no issues', function(done){
                function simulateFileChange () {
                    bsCalledWith.middleware(null, null, assertions);
                }

                function assertions () {
                    expect(debugMessage).toBe('Build successful');
                    done();
                }
                rawPlugin(null, metalsmithMock, simulateFileChange);
            });

            it('should give the error message when the build has an error', function(done){
                metalsmithMock.build = function(callback){
                    callback('test error');
                };
                function simulateFileChange () {
                    bsCalledWith.middleware(null, null, assertions);
                }

                function assertions () {
                    expect(debugMessage).toBe('test error');
                    done();
                }
                rawPlugin(null, metalsmithMock, simulateFileChange);
            });
        });
    });
});