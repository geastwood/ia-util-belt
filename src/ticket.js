var ticket = require('./core/ticket');
var Manager = require('../lib/ticket-template-core/src/data/manager');
var provider = require('../lib/ticket-template-core/src/data/provider');
var inquirer = require('inquirer');
var _ = require('lodash');

module.exports = {
    edit: function() {
        inquirer.prompt([{
            name: 'ticketNr',
            message: 'Please give ticket number (e.g. FR-5442)',
            validate: function(v) {
                if (_.isEmpty(v)) {
                    return 'Ticket number is required.';
                }
                if (!/[A-Z]{2,2}-\d{4,4}/.test(v)) {
                    return 'Ticket number invalid, e.g. FR-5442 is valid.';
                }
                return true;
            }
        }],
        function(answers) {
            var m = Manager.create(provider.create('jira', answers.ticketNr));
            m.getData().then(function(data) {
                ticket(data);
            });
        });
    },
    create: function() {
    },
    save: function() {

    }
};
