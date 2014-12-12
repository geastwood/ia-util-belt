var prompt      = require('prompt'),
    chalk       = require('chalk'),
    nodeUtil    = require('util');

var util = {
    parseGlobal: function(options) {
        var config = {app: null, branch: null, flag: null},
            groups = {
                app: {
                    options: ['frontend', 'service'],
                    'default': 'frontend'
                },
                branch: {
                    options: ['trunk', 'release', 'current'],
                    'default': 'trunk'
                },
                flag: {
                    options: ['part', 'development', 'legacy', 'serviceclient', 'module'],
                    'default': null
                }
            };
        Object.keys(groups).forEach(function(key) {
            var found = false;
            groups[key].options.forEach(function(option) {
                if (options[option]) {
                    config[key] = option;
                    found = true;
                }
            });
            if (!found) {
                config[key] = groups[key]['default'];
            }
        });
        return config;
    },
    yesno: function(fn, opts) {
        var answer = 'no';
        opts = opts || {};

        prompt.get([{
            name:   'yesno',
            message: opts.message || 'continue?',
            validator: /(yes|no)/,
            'default': opts['default'] || 'yes'
        }], function(err, inputs) {
            if (err) {
                console.log('Error: cancelled by user.');
                return;
            }
            answer = inputs.yesno;
            fn(answer);
        });
    },
    print: function(type, action) {
        var colorMap = {
            info: 'blue',
            error: 'red',
            success: 'green'
        },
        color = colorMap[type],
        message,
        rest;
        action = action || 'NONE';

        message = chalk[color](type.toUpperCase() + '\u0009(' + action.toUpperCase() + ')\u0009');
        rest = nodeUtil.format.apply(null, [].slice.call(arguments, 2));
        console.log(nodeUtil.format.call(null, message, rest));
    }
};
module.exports = util;
