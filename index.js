var _ = require('lodash');
var browserSync = require('browser-sync');
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
        _.merge(bsOptions, options);

        //Require options that are non-negotiable
        bsOptions.middleware = function (req, res, next) {
            metalsmith.build(function (err) {
                var buildMessage = err ? err : 'Build successful';
                debug(buildMessage);
                next();
            });
        };
        browserSync(bsOptions);
        done();
    }
    plugin._pluginName = PLUGIN_NAME;
    return plugin;
}

module.exports = browserSyncPlugin;