var path = require('path'),
    fs   = require('fs'),
    exec = require('child_process').exec,
    api;

api = module.exports = function(options) {

    return {
        run: function() {
            var logFile, appLogFile, targetPath;

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

                targetPath = options.core.IA().path.calculateAppPath(inputs.branch, 'service');
                logFile = path.join(targetPath, 'log');
                appLogFile = path.join(logFile, 'application.log');

                fs.chmod(logFile, '0777', function(err) {
                    if (err) {
                        throw err;
                    }
                    options.core.util.print('success', 'updated', 'chmod 0777 of "%s"', logFile);
                    exec('touch ' + appLogFile + ' && chmod 0777 ' + appLogFile, function() {});
                });

            });

        }
    };
};
