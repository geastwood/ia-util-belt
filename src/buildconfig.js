var fs          = require('fs');
var chalk       = require('chalk');
var util        = require(__dirname + '/util');
var prompt      = require('prompt');
var Q           = require('q');
var _           = require('lodash');
var inquirer    = require('inquirer');

var getSelection = function(data) {
    var defer = Q.defer();

    inquirer.prompt([{
        name: 'selectedId',
        type: 'checkbox',
        choices: data.map(function(v, i) {
            return {name: v.path + v.text, value: i};
        }),
        message: 'Please select module to delete'
    }], function(answers) {
        defer.resolve(answers.selectedId.map(function(id) {
            return data[id];
        }));
    });

    return defer.promise;
};

var write = function(path, data) {
    var defer = Q.defer();
    fs.writeFile(path, JSON.stringify(data, null, 4), 'utf8', function(err) {
        util.print('success', 'write', 'Data write to "%s"', path);
        defer.resolve(true);
    });
    return defer.promise;
};

// TODO
var helper = {
    shouldDelete: function (pkgs, target) {
        pkgs.forEach(function(pkg) {
            if (pkg.fileIncludes) {
                _.remove(pkg.fileIncludes, function(item) {
                    return _.isEqual(item, target);
                });
            }
        });
        return pkgs;
    }
};

var buildconfig = function(path) {
    var raw = null;
    return {
        getData: function() {
            return Q.nfbind(fs.readFile)(path, 'utf8').then(JSON.parse);
        },
        getPkgs: function() {
            return this.getData().then(function(data) {
                raw = data;
                return data.pkgs;
            });
        },
        removePkgs: function(toRemovePkgs) {
            toRemovePkgs.forEach(function(target) {
                raw.pkgs = helper.shouldDelete(raw.pkgs, target);
            });
            return raw;
        },
        find: function(pattern) {
            return this.getPkgs().then(function(pkgs) {
                var test = new RegExp(pattern, 'i');

                return pkgs.reduce(function(initial, curr) {
                    var fileIncludes = curr.fileIncludes || [];
                    return _.union(initial, fileIncludes.filter(function(file) {
                        return test.test(file.text);
                    }));
                }, []);
            });
        },
        getMatched: function(pattern) {
            return this.find(pattern).then(function(rst) {
                if (rst.length === 0) {
                    throw new Error('empty');
                }
                return rst;
            });
        },
        remove: function(pattern) {
            this.getMatched(pattern).then(function(data) {
                return getSelection(data);
            }).then(function(toRemovePkgs) {
                return this.removePkgs(toRemovePkgs);
            }.bind(this)).then(function(data) {
                return write(path, data);
            }).catch(function() { // reject with status false
                console.log(chalk.red('\nNo result found.\n'));
            });
        },
        print: function(pattern) {
            this.organized(pattern).then(function(struct) {
                if (struct.status === 'empty') {
                    console.log(chalk.red('\nNo result found.\n'));
                } else {
                    struct.data.matchRst.forEach(function(file, i) {
                        console.log(chalk.green('match #' + (i + 1) + ' --> ') + '%s%s', file.path, file.text);
                    });
                }
            });
        }
    };
};
