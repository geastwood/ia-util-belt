var exec    = require('child_process').exec,
    fs      = require('fs'),
    path    = require('path'),
    chalk   = require('chalk'),
    api;

api = module.exports = function() {
    return {
        run: function(options) {
            var child,
                file = path.join(__dirname + '/../scripts/' + options.file);

            if (!fs.existsSync(file)) {
                console.log(chalk.red('INFO\u0009(ERROR)\u0009') + '"%s" doesn\'t exist, fail to execute', options.file);
                return;
            }

            child = exec('sh scripts/' + options.file);
            child.stdout.on('data', function(data) {
                console.log(data);
            });
            child.stderr.on('data', function(data) {
                console.log(data);
            });
        }
    };
};
