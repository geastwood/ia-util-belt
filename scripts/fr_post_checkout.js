var path = require('path'), api;

api = module.exports = function(options) {

    return {
        run: function() {
            var userConfigPlugin, importantConfigPlugin, targetPath;
            options.core.prompt.getBranch({rst: {}, args: {}}).then(function(opts) {

                targetPath = options.core.IA().path.calculateAppPath(opts.rst.branch, 'frontend');
                userConfigPlugin = require(path.join(options.packageDir, 'src', 'plugin', 'userConfigPHP'));
                userConfigPlugin(options).copy(path.join(targetPath, 'legacy', 'config', 'user'));

                importantConfigPlugin = require(path.join(options.packageDir, 'src', 'plugin', 'importantConfigPHP'));
                importantConfigPlugin(options).copy(path.join(targetPath, 'legacy', 'config', 'user'));
            });
        }
    };
};
