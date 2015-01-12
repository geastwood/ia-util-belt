var inquirer    = require('inquirer');
var Q           = require('q');
var fs          = require('fs');
var IA          = require('./ia');
var _           = require('lodash');
var configFile  = 'user.config.json';

// This class allows user to config this cli and save the settings to ~/.ia/user.config.json
var api = function () {

    userConfig.get().then(function(struct) {
        actions(struct);
    }).catch(function(err) {
        throw new Error(err);
    });
};

var userConfig = {
    filePath: IA().util.getUserConfigFolder('user.config.json'),
    /**
     * create user config file
     * @returns {promise|*|Q.promise}
     */
    create: function () {
        return Q.nfbind(fs.writeFile)(this.filePath, JSON.stringify({}, null, 4));
    },
    /**
     * checking existence of user config file
     * @returns {promise|*|Q.promise}
     */
    exists: function() {
        var defer = Q.defer();
        fs.exists(this.filePath, function(exists) {
            defer.resolve(exists);
        });
        return defer.promise;
    },
    /**
     * read action for config file
     * @returns {promise|*|Q.promise}
     */
    read: function() {
        return Q.nfbind(fs.readFile)(this.filePath, 'utf8');
    },
    /**
     * first check the existence of `user.config.json`
     * if there is none, create
     * if there is, then continue
     *
     * @returns {promise|*|Q.promise}
     */
    get: function() {
        var defer = Q.defer();
        this.exists().then(function(exists) {
            if (!exists) {
                this.create().then(function(success){
                    defer.resolve({status: 'created', data: {}});
                });
            }
            this.read().then(function(data) {
                defer.resolve({status: 'exist', data: data});
            });
        }.bind(this));

        return defer.promise.then(function(struct) {
            //mixin more methods
            struct.save = function() {
                fs.writeFileSync(this.filePath, JSON.stringify(struct.data, null, 4));
            }.bind(this);
            return struct;
        }.bind(this)).then(function(struct) {
            if (typeof struct.data === 'string') {
                struct.data = JSON.parse(struct.data);
            }
            return struct;
        });

    }
};

var actions = function(struct){
    inquirer.prompt([{
        name: 'action',
        type: 'list',
        choices: [{
            name: 'Username', value: 'username'
        }, {
            name: 'Jira password', value: 'jiraPassword'
        }],
        message: 'Please choose'
    }, {
        name: 'username',
        type: 'input',
        message: 'Please give your username',
        when: function(answers) {
            return answers.action === 'username';
        },
        validate: function(v) {
            return _.isEmpty(v) ? 'Required!' : true;
        }
    }, {
        name: 'jiraPassword',
        type: 'password',
        message: 'Please give your Jira password',
        when: function(answers) {
            var toPrompt = true;
            if (!_.isEmpty(struct.data.jiraPassword)) {
                toPrompt = false;
            }
            return answers.action === 'jiraPassword';
        },
        validate: function(v) {
            return _.isEmpty(v) ? 'Required!' : true;
        }
    }], function(answers) {
        if (answers.action === 'username') {
            struct.data.username = answers.username;
        } else {
            struct.data.jiraPassword = answers.jiraPassword;
        }
        struct.save();
    });
};
module.exports = api;
