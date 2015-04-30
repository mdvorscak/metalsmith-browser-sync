var _ = require('lodash');
var bs = require('browser-sync').create();
var debug = require('debug')('metalsmith-browser-sync');

var PLUGIN_NAME = 'browser-sync';
function browserSyncPlugin(options){
    function plugin(files, metalsmith, done) {
        // first time through remove ourselves, since we will be continously building
        // and we only need one browser-sync server active
        metalsmith.plugins.forEach(function(plugin, index){
            if(plugin._pluginName === PLUGIN_NAME){
                metalsmith.plugins.splice(index, 1);
            }
        });
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

        done();
    }
    plugin._pluginName = PLUGIN_NAME;
    return plugin;
}

module.exports = browserSyncPlugin;