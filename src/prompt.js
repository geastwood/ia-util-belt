var _           = require('lodash');
var Q           = require('q');
var inquirer    = require('inquirer');

/**
 * confirm utility, return promise for interactionG
 * @param {Object} opts Object to config the prompt
 * @returns {promise|*|Q.promise}
 */
var yesno = function(opts) {
    var defer = Q.defer();
    _.defaults(opts || {}, {
        message: 'continue?',
        'defaultYes': true
    });

    inquirer.prompt([{
        name: 'yesno',
        type: 'confirm',
        message: opts.message,
        'default': opts.defaultYes
    }], function(answers) {
        defer.resolve(answers.yesno);
    });

    return defer.promise;
};

var factory = {
    definition: {
        app: {
            name: 'app',
            message: 'Please select application',
            list: [{
                name: 'Frontend (-f)', value: 'frontend'
            }, {
                name: 'Service (-s)', value: 'service'
            }],
            type: 'list'
        },
        branch: {
            name: 'branch',
            message: 'Please select branch',
            list: [{
                name: 'trunk (-t)', value: 'trunk'
            }, {
                name: 'current (-c)', value: 'current'
            }, {
                name: 'release (-r)', value: 'release'
            }],
            type: 'list'
        },
        target: {
            name: 'target',
            message: 'Please select a target for build',
            list: [{
                name: 'full build', value: 'full'
            }, {
                name: 'part (-p)', value: 'part'
            }, {
                name: 'development (-d)', value: 'development'
            }, {
                name: 'legacy (-l)', value: 'legacy'
            }, {
                name: 'service client (-v)', value: 'serviceclient'
            }, {
                name: 'module (-m)', value : 'module'
            }],
            type: 'list'
        }
    },
    exists: function(poll, target) {
        var rst = null;
        poll.map(function(item) {
            return item.value;
        }).some(function(item) {
            if (target[item]) {
                rst = item;
                return true;
            }
        });
        return rst;
    },
    create: function(type) {
        var definition = this.definition[type];

        return function(opts) {
            var defer = Q.defer(),
                rst = opts.rst,
                defaultVal = this.exists(definition.list, opts.args);

            if (defaultVal) {
                rst[definition.name] = defaultVal;
                defer.resolve({rst: rst, args: opts.args});
            } else {
                inquirer.prompt([{
                    name: definition.name,
                    type: definition.type,
                    choices: definition.list,
                    message: definition.message
                }], function(answers) {
                    rst[definition.name] = answers[definition.name];
                    defer.resolve({rst: rst, args: opts.args});
                });
            }
            return defer.promise;
        }.bind(this);
    }
};

module.exports.yesno = yesno;
module.exports.getBuildOptions = function(options) {
    var app = factory.create('app'),
        branch = factory.create('branch'),
        target = factory.create('target');

    return app({rst: {}, args: options}).then(branch).then(target);
};
module.exports.getApp = function(options) {
    return factory.create('app')({rst: {}, args: options});
};
module.exports.getBranch = function(options) {
    return factory.create('branch')({rst: {}, args: options});
};
