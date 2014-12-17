var fs          = require('fs'),
    path        = require('path'),
    IA          = require(__dirname + '/../ia'),
    chalk       = require('chalk'),
    emailReg    = /(\w+)@intelliad.com/g,
    fileName    = 'config.user.php',
    packageDir  = path.resolve(__dirname, '../..'),
    api;

api = module.exports = function(options) {

    options = options || {};

    packageDir = options.packageDir || packageDir;

    return {
        copy: function(file) {
            var that = this;
            fs.readFile(path.join(packageDir, 'templates/config.user.php'), 'utf8', function(err, data) {
                fs.writeFile(path.join(file, fileName), data, 'utf8', function(err) {
                    if (err) {
                        throw err;
                    }
                    console.log(chalk.green('SUCCESS\u0009(CREATED)\u0009') + '"%s" is copied to "%s"',
                                fileName, file);
                    that.enterEmail(path.join(file, fileName), function(username) {
                        console.log(chalk.green('SUCCESS\u0009(UPDATED)\u0009') + 'Email is updated to "%s"',
                                    username + '@intelliad.com');
                    });
                });
            });
        },
        enterEmail: function(file, fn) {
            var username = IA().util.getUser();
            fs.readFile(file, 'utf8', function(err, data) {
                var rst = data.replace(emailReg, function() {
                    return username + '@intelliad.com';
                });
                fs.writeFile(file, rst, 'utf8');
                /* jshint expr: true */
                fn && fn(username);
            });
        }
    };
};

/* DEBUG */
// api().copy(path.normalize('/Users/feiliu/Desktop/config.user.php'));
// api()
