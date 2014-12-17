var exec    = require('child_process').exec,
    fs      = require('fs'),
    path    = require('path'),
    IA      = require(__dirname + '/ia'),
    util    = require(__dirname + '/util'),
    api,
    factory;

factory = {
    '.sh': function(options) {
        var child, command = 'sh ' + options.file;

        if (options.args) {
            command += (' ' + options.args);
        }

        child = exec(command);
        child.stdout.on('data', function(data) {
            util.stdout(data);
        });
        child.stderr.on('data', function(data) {
            util.stdout(data);
        });
    },
    '.js': function(options) {
        var jsscript = require(options.file);
        jsscript(options).run();
    }
};

api = module.exports = function() {

    return {
        run: function(options) {
            var file = IA().util.getScriptFile(options.file),
                ext = path.extname(file);

            if (!fs.existsSync(file)) {
                util.print('error', 'error', '"%s" doesn\'t exist, fail to execute.', options.file);
                return;
            }
            if (!factory[ext]) {
                util.print('error', 'error', 'Unsupported file type "%s"', ext);
                return;
            }

            factory[ext]({
                file: file,
                args: options.args
            });

        }
    };
};
