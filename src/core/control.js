var fs      = require('fs'),
    chalk   = require('chalk'),
    path    = require('path'),
    homeFolder = process.env.HOME,
    api;

api = module.exports = function() {
    return {
        username: function(fn) {
            fn = fn || function() {};
            var prompt;
            var userConfigFile = homeFolder + '/.ia/user.config.json',
                userConfigs,
                hasUsername = false,
                hasPassword = false,
                promptConfigs = [];

            if (fs.existsSync(userConfigFile)) {
                userConfigs = require(userConfigFile);
                hasUsername = !!userConfigs.username;
                hasPassword = !!userConfigs.password;
            }

            if (!hasUsername) {
                promptConfigs.push({
                    name: 'username',
                    required: true,
                    description: 'Please specify username',
                    pattern: /\w{1,20}/
                });
            }
            if (!hasPassword) {
                promptConfigs.push({
                    name: 'password',
                    required: true,
                    password: true,
                    description: 'Please specify svn password',
                    pattern: /\w{1,20}/
                });
            }

            if (hasUsername && hasPassword) {
                fn(userConfigs.username);
            }

            if (promptConfigs.length > 0) {
                prompt = require('prompt');
                prompt.get(promptConfigs,
                function(err, inputs) {
                    var data = JSON.stringify({
                        'username': inputs.username || userConfigs.username,
                        'password': inputs.password || ''
                    }, null, 4);

                    fs.writeFile(userConfigFile, data, 'utf8', function(err) {
                        if (err) {
                            throw err;
                        }
                        console.log(chalk.green('SUCCESS\u0009(Set)\u0009') + '%s is saved to "%s"',
                                    inputs.username,
                                    userConfigFile);
                        fn(inputs.username||userConfigs.username);
                    });
                });
            }
        }
    };
};

/* DEBUG */
// api().username(function(username) {
//     console.log('custom callback', username);
// });
