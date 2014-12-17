var path = require('path'), api;

api = module.exports = function(options) {

    return {
        run: function() {
            var userConfigPlugin, importantConfigPlugin, targetPath;
            options.core.prompt.get([{
                name: 'branch',
                description: ('Which branch?').green,
                required: true,
                'default': 'current',
                pattern: /(trunk|current|release)/
            }],
            function(err, inputs) {
                if (err) {
                    console.log('Error: cancelled by user.');
                    return;
                }

                targetPath = options.core.IA().path.calculateAppPath(inputs.branch, 'frontend');
                userConfigPlugin = require(path.join(options.packageDir, 'src', 'plugin', 'userConfigPHP'));
                userConfigPlugin(options).copy(path.join(targetPath, 'legacy', 'config', 'user'));

                importantConfigPlugin = require(path.join(options.packageDir, 'src', 'plugin', 'importantConfigPHP'));
                importantConfigPlugin(options).copy(path.join(targetPath, 'legacy', 'config', 'user'));
            });

        }
    };
};
