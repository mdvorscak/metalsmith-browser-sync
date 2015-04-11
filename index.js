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
        browserSync({
            server     : "build",
            files      : ["src/**/*.md", "templates/**/*.hbs"],
            middleware : function (req, res, next) {
                metalsmith.build(function (err) {
                    var buildMessage = err ? err : 'Build successful';
                    debug(buildMessage);
                    next();
                });
            }
        });
        done();
    }
    plugin._pluginName = PLUGIN_NAME;
    return plugin;
}

module.exports = browserSyncPlugin;