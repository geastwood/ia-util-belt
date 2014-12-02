var fs = require('fs');
var chalk = require('chalk');
var promp = require('prompt');

var buildconfig = function(path) {

    var data = dataManager(path);

    return {
        findFile: function(pattern, opts) {
            var that = this;
            data.getData(function(content) {
                var pkgs = content.pkgs;
                var test = new RegExp(pattern, 'i');
                var rst = [];
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
                console.log(chalk.red('\n\nNo result found.\n\n'));
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
            promp.get([{
                name: 'id',
                description: 'Which to delete?',
                pattern: /\d+/
            }], function(err, prompts) {
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
                        console.log('data write to "%s"', path);
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
