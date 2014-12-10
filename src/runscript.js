var exec    = require('child_process').exec,
    fs      = require('fs'),
    chalk   = require('chalk'),
    IA      = require(__dirname + '/ia'),
    api;

api = module.exports = function() {
    return {
        run: function(options) {
            var child,
                file = IA().util.getScriptFile(options.file);

            if (!fs.existsSync(file)) {
                console.log(chalk.red('INFO\u0009(ERROR)\u0009') + '"%s" doesn\'t exist, fail to execute', options.file);
                return;
            }

            child = exec('sh ' + file);
            child.stdout.on('data', function(data) {
                console.log(data);
            });
            child.stderr.on('data', function(data) {
                console.log(data);
            });
        }
    };
};
