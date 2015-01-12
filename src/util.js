var prompt      = require('prompt');
var chalk       = require('chalk');
var nodeUtil    = require('util');

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
            message: (opts.message || 'continue?').green,
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
        rest,
        i;

        action = action || 'NONE';
        action = '(' + action.toUpperCase() + ')';

        for (i = action.length; i < 16; i++) {
            action += ' ';
        }

        message = chalk[color](type.toUpperCase() + '\u0009' + action.toUpperCase() + '\u0009');
        rest = nodeUtil.format.apply(null, [].slice.call(arguments, 2));
        console.log(nodeUtil.format.call(null, message, rest));
    },
    stdout: function(data) {
        nodeUtil.print(data);
    },
    /**
     * Simple interpolate function
     *
     * @param {String} template String to be interpolated
     * @param {Object} config data to be passed to string
     * @return {String} Interpolated string
     */
    interpolate: function(template, config) {
        return template.replace(/\{\{([(?:\w|\|)]+)}}/gm, function(a, b) {
            var parts = b.split('|').filter(function(part) {
                part = part.trim();
                return part.length > 0;
            }),
            data = config[parts[0]],
            actions = parts.slice(1),
            actionMaps = {
                capitilize: function(v) {
                    return v.charAt(0).toUpperCase() + v.substring(1);
                }
            };
            actions.forEach(function(action) {
                data = actionMaps[action](data);
            });
            return data;
        });
    }
};
module.exports = util;
