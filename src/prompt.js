var _           = require('lodash');
var Q           = require('q');
var inquirer    = require('inquirer');

/**
 * confirm utility, return promise for interactionG
 * @param opts
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

module.exports.yesno = yesno;
