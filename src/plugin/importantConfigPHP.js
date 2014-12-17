var fs      = require('fs'),
    path    = require('path'),
    chalk   = require('chalk'),
    api,
    fileName = 'config.important.inc.php';

api = module.exports = function(options) {
    options = options || {};

    var packageDir = options.packageDir || __dirname;
    return {
        copy: function(file) {
            fs.readFile(path.join((packageDir + '/../../templates/config.important.inc.php')), 'utf8', function(err, data) {
                fs.writeFile(path.join(file, fileName), data, 'utf8', function(err) {
                    if (err) {
                        throw err;
                    }
                    console.log(chalk.green('SUCCESS\u0009(CREATED)\u0009') + '"%s" is copied to "%s"',
                                fileName, file);
                });
            });
        }
    };
};

/* DEBUG */
// api.copy(path.normalize('/Users/feiliu/Desktop/config.fei.php'));
