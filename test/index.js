/**
 * Created by Mike Dvorscak on 4/11/15.
 */
var Promise         = require('promise');
var proxyquire      = require('proxyquire');
var Metalsmith      = require('metalsmith');

// Mocks
var bsCalledWith    = {};
var bsWatching;
var bsCalls = 0;
var bsReloadCount = 0;
var bsPaused = false;
var rebuild;

var browserSyncMock = {
    browserSync : {
        create: function () {
            var bs = {

                paused: false,

                watch: function(files, opts){
                    bsWatching = files;

                    return {
                        on: function(name, cb) {
                          if ('all' === name) {
                            rebuild = cb;
                          }
                        }
                    };
                },

                init: function(options) {
                    bsCalls++;
                    bsCalledWith = options;
                },

                pause: function() {
                  bs.paused = bsPaused = true;
                },

                resume: function() {
                  bs.paused = bsPaused = false;
                },

                reload: function() {
                  bsReloadCount++;
                }
            };

            return bs;
        }
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

    function buildErrorHandler (err) {
        expect('build').toBe('successful');
        console.error(err);
    }

    beforeEach(function () {
        debugMessage = '';
        build = function builder (plugin) {
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
                expect(bsWatching).toEqual(["src/**/*.md", "templates/**/*.hbs"]);
            }

            build(plugin()).then(assertions).catch(buildErrorHandler).then(done);
        });

        it('should allow me to specify the watched files', function (done) {
            function assertions () {
                expect(bsWatching).toEqual(['test/*.test']);
            }

            build(plugin({files : ['test/*.test']})).then(assertions).catch(buildErrorHandler).then(done);
        });
    });

    it('should not effect other plugins', function(done){
        var foo;
        var plugin2 = function(){
            return function setFoo(){
                foo = true;
            };
        };
        var build2 = function builder2 (plugin) {
            return new Promise(function (resolve, reject) {
                Metalsmith('test')
                    .source('fixtures')
                    .use(plugin2())
                    .use(plugin)
                    .build(function (err) {
                               if (err) {
                                   reject(err);
                               }
                               resolve();
                           });
            });
        };

        function assertions () {
            expect(foo).toBe(true);
        }

        build2(plugin()).then(assertions).catch(buildErrorHandler).then(done);
    });

    describe('metalsmith mock tests', function(){
        var rawPlugin, metalsmithMock;
        beforeEach(function(){
            bsCalls = 0;
            bsReloadCount = 0;
            rawPlugin = plugin();
            metalsmithMock = {
                build : function(callback){
                    expect(bsPaused).toBe(true);
                    callback();
                    expect(bsPaused).toBe(false);
                    expect(bsReloadCount).toBeGreaterThan(0);
                },
                plugins : []
            };
        });
        it('should not attempt to launch multiple browser-sync servers (after each file change)', function (done) {
            spyOn(metalsmithMock, 'build').and.callThrough();

            function simulateFileChange () {
                rebuild();
                rebuild();
                expect(metalsmithMock.build.calls.count()).toBe(2);
                expect(bsReloadCount).toBe(2);
                expect(bsCalls).toBe(1);
                done();
            }
            rawPlugin(null, metalsmithMock, simulateFileChange);
        });

        it('rebuild when a watched file changes', function (done) {

            spyOn(metalsmithMock, 'build').and.callThrough();

            function simulateFileChange () {
                rebuild();
                expect(debugMessage).toBe('Build successful');
                expect(metalsmithMock.build.calls.count()).toBe(1);
                expect(bsReloadCount).toBe(1);
                done();
            }
            rawPlugin(null, metalsmithMock, simulateFileChange);
        });

        describe('debug messages', function(){
            it('should be successful if there were no issues', function(done){
                function simulateFileChange () {
                    rebuild();
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
                    rebuild();
                    expect(debugMessage).toBe('test error');
                    done();
                }
                rawPlugin(null, metalsmithMock, simulateFileChange);
            });
        });
    });
});