var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
var ticket = require('./core/ticket');
var Manager = require('../lib/ticket-template-core/src/data/manager');
var provider = require('../lib/ticket-template-core/src/data/provider');
var ttUtil = require('../lib/ticket-template-core/src/util');
var util = require('./util');
var chalk = require('chalk');
var IA = require('./ia');
var templateDataFolder = IA().util.getUserConfigFolder('data', 'templates');

module.exports = {
    edit: function() {
        var that = this;
        inquirer.prompt([{
            name: 'ticketNr',
            message: 'Please give ticket number (e.g. FR-5442)',
            validate: function(v) {
                if (_.isEmpty(v)) {
                    return 'Ticket number is required.';
                }
                if (!/[A-Za-z]{2,2}-\d{4,4}/.test(v)) {
                    return 'Ticket number invalid, e.g. FR-5442 is valid.';
                }
                return true;
            },
            filter: function(v) {
                return v.toUpperCase();
            }
        }],
        function(answers) {
            var ticketNr = answers.ticketNr,
                m = Manager.create(provider.create('jira', ticketNr));

            m.getData().then(function(data) {
                ticket(data, function(data) {
                    console.log(chalk.yellow(ttUtil.pad('=').pad('', 140)));
                    console.log(data.print('pretty'));
                    console.log(chalk.yellow(ttUtil.pad('=').pad('', 140)), '\n');
                    inquirer.prompt([{
                        name: 'save',
                        type: 'confirm',
                        message: 'Save to clipboard?',
                        'default': true
                    }],
                    function(answers) {
                        if (answers.save) {
                            that.pipe(data.print('jira'), ticketNr);
                        } else {
                            util.print('info', 'info', 'No damage done, cancelled by user.');
                        }
                    });
                });
            });
        });
    },
    create: function() {
        var presets = Manager.getPresets(),
            files = presets.files.map(function(filename) {
                return {
                    name: filename.charAt(0).toUpperCase() + filename.slice(1) + ' Template',
                    value: filename
                };
            }),
            that = this;

        inquirer.prompt([{
            name: 'type',
            type: 'list',
            choices: files.reverse(), // ticket template first
            message: 'Please select template'
        }], function(answers) {
            var m = Manager.create(provider.create('local', path.join(presets.filepath, answers.type)));
            m.getData('parse').then(function(data) {
                ticket(data, function(data) {
                    inquirer.prompt([{
                        name: 'filename',
                        type: 'input',
                        message: 'Please specify file name to save',
                        validate: function(v) {
                            if (_.isEmpty(v)) {
                                return 'file name is required. e.g. FR-5454.';
                            }
                            if (fs.existsSync(path.join(templateDataFolder, v))) {
                                return 'file already exists.';
                            }
                            return true;
                        }
                    },{
                        name: 'save',
                        type: 'confirm',
                        message: 'Save to file?',
                        'default': true
                    }],
                    function(answers) {
                        if (answers.save) {
                            that.write(data.print('jira'), path.join(templateDataFolder, answers.filename));
                        } else {
                            util.print('info', 'info', 'No damage done, cancelled by user.');
                        }
                    });
                });
            });
        });
    },
    pipe: function(data, ticketNr) {
        var pbcopy = require('child_process').spawn('pbcopy', [], {stdin: 'pipe'}),
            rs = new require('stream').Readable();

        rs.push(data);
        rs.push(null);
        rs.pipe(pbcopy.stdin);
        util.print('success',
                   'success',
                   'Data of ' + chalk.green("%s") + ' has been copied to clipboard',
                   ticketNr);
    },
    write: function(data, file) {
        fs.writeFile(file, data, function(err) {
            if (err) {
                throw err;
            }
            util.print('success', 'success', 'Data has been saved to "%s".', file);
        });
        this.pipe(data, path.basename(file));
    },
    'delete': function() {
        var choices = fs.readdirSync(templateDataFolder).map(function(file) {
                return {name: file, value: file};
            });
        inquirer.prompt([{
            name: 'deleteList',
            type: 'checkbox',
            choices: choices,
            message: 'Please select to delete',
        }], function(answers) {
            answers.deleteList.forEach(function(file) {
                fs.unlink(path.join(templateDataFolder, file), function(err) {
                    if (err) {
                        throw err;
                    }
                    util.print('success', 'success', '"%s" is removed.', file);
                });
            });
        });
    },
    read: function() {
        var that = this,
            choices = fs.readdirSync(templateDataFolder).map(function(file) {
                return {name: file, value: file};
            });

        if (choices.length === 0) {
            util.print('info', 'info', 'There is no data stored locally.');
            return undefined;
        }

        inquirer.prompt([{
            name: 'filename',
            type: 'list',
            choices: choices,
            message: 'which to load?',
            validate: function(v) {
                if (_.isEmpty(v)) {
                    return 'file name is required';
                }
                return true;
            }
        }],
        function(answers) {
            fs.readFile(path.join(templateDataFolder, answers.filename), 'utf8', function(err, data) {
                that.pipe(data, answers.filename);
            });
        });
    }
};
