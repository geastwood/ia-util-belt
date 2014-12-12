var exec    = require('child_process').exec,
    fs      = require('fs'),
    IA      = require(__dirname + '/ia'),
    util    = require(__dirname + '/util'),
    api;

api = module.exports = function() {
    return {
        run: function(options) {
            var child,
                file = IA().util.getScriptFile(options.file);

            if (!fs.existsSync(file)) {
                util.print('error', 'error', '"%s" doesn\'t exist, fail to execute.', options.file);
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
