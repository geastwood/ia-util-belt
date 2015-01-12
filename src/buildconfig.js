var fs      = require('fs');
var chalk   = require('chalk');
var util    = require(__dirname + '/util');
var prompt  = require('prompt');

var buildconfig = function(path) {

    var data = dataManager(path);

    return {
        findFile: function(pattern, opts) {
            var that = this;
            data.getData(function(content) {

                var pkgs = content.pkgs,
                    test = new RegExp(pattern, 'i'),
                    rst = [];

                pkgs.forEach(function(pkg) {
                    if (pkg.fileIncludes) {
                        pkg.fileIncludes.forEach(function(file) {
                            if (test.test(file.text)) {
                                rst.push(file);
                            }
                        });
                    }
                });

                if (opts.toRemove) {
                    that.toRemove(rst);
                } else {
                    that.format(rst);
                }
            });
        },
        format: function(rst) {
            if (rst.length === 0) {
                console.log(chalk.red('\nNo result found.\n'));
                return;
            }
            rst.forEach(function(file, i) {
                console.log(chalk.green('match #' + (i + 1) + ' --> ') + '%s%s', file.path, file.text);
            });
        },
        toRemove: function(rst) {
            this.format(rst);
            if (rst.length === 0) {
                return;
            }
            prompt.get([{
                name: 'id',
                description: ('Which to delete?').green,
                pattern: /\d+/
            }], function(err, prompts) {
                if (err) {
                    console.log('Error: cancelled by user.');
                    return;
                }
                data.getData(function(content) {
                    var pkgs = content.pkgs;
                    pkgs.forEach(function(pkg) {
                        if (pkg.fileIncludes) {
                            var id = pkg.fileIncludes.indexOf(rst[prompts.id - 1]);
                            if (id >= 0) {
                                pkg.fileIncludes.splice(id, 1);
                            }
                        }
                    });
                    content = JSON.stringify(content, null, '    ');
                    fs.writeFile(path, content, function(err) {
                        if (err) {
                            throw err;
                        }
                        util.print('success', 'write', 'Data write to "%s"', path);
                    });

                });
            });
        }
    };
};

var dataManager = function(path) {
    var hasData = false, content = null;

    return {
        getData: function(fn) {
            if (hasData === false) {
                util.print('info', 'info', 'Search in "%s".', path);
                fs.readFile(path, 'utf8', function(err, data) {
                    if (err) {
                        throw err;
                    }
                    hasData = true;
                    content = JSON.parse(data);
                    fn(content);
                });
            } else {
                fn(content);
            }
        }
    };
};

module.exports = buildconfig;
