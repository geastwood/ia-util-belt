var _ = require('lodash');
var inquirer = require('inquirer');
var ticket = require('./core/ticket');
var Manager = require('../lib/ticket-template-core/src/data/manager');
var provider = require('../lib/ticket-template-core/src/data/provider');
var pad = require('../lib/ticket-template-core/src/util').pad;
var util = require('./util');
var chalk = require('chalk');

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
            var ticketNr = answers.ticketNr;
            var m = Manager.create(provider.create('jira', ticketNr));
            m.getData().then(function(data) {
                ticket(data, function(data) {
                    console.log(chalk.yellow(pad('=').pad('', 140)));
                    console.log(data.print('pretty'));
                    console.log(chalk.yellow(pad('=').pad('', 140)), '\n');
                    inquirer.prompt([{
                        name: 'save',
                        type: 'confirm',
                        message: 'Save to clipboard?',
                        'default': true
                    }],
                    function(answers) {
                        // jshint expr: true
                        if (answers.save) {
                            that.save(data, ticketNr);
                        } else {
                            util.print('info', 'info', 'No damage done, cancelled by user.');
                        }
                    });
                });
            });
        });
    },
    create: function() {
    },
    save: function(data, ticketNr) {
        var pbcopy = require('child_process').spawn('pbcopy', [], {stdin: 'pipe'}),
            rs = new require('stream').Readable();

        rs.push(data.print('jira'));
        rs.push(null);
        rs.pipe(pbcopy.stdin);
        util.print('success',
                   'success',
                   'Data of ' + chalk.green("%s") + ' has been copied to clipboard',
                   ticketNr);
    }
};
