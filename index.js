var _ = require('lodash');
var bs = require('browser-sync').create();
var debug = require('debug')('metalsmith-browser-sync');

function browserSyncPlugin(options){
    function plugin(files, metalsmith, done) {
        // Only execute the plugin if browser-sync isn't active.
        if (!bs.active) {
            //default options
            var bsOptions = {
                server     : "build",
                files      : ["src/**/*.md", "templates/**/*.hbs"]
            };
            _.merge(bsOptions, options, function merger(a, b){
                //Always use the array given if there is one
                if(_.isArray(a)){
                    return b;
                }
            });
    
            function rebuild() {
                if (!bs.paused) {
                    bs.pause();
    
                    metalsmith.build(function(err) {
                        var buildMessage = err ? err : 'Build successful';
                        debug(buildMessage);
    
                        bs.resume();
                        bs.reload();
                    });
                }
            };
    
            var watched = bsOptions.files;
            delete bsOptions.files;
    
            bs.watch(watched, { ignoreInitial: true }).on('all', rebuild);
            bs.init(bsOptions);
        }
        
        // Always continue the plugin chain.
        done();
    }
    return plugin;
}

module.exports = browserSyncPlugin;