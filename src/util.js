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
    }
};
module.exports = util;
