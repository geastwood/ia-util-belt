var fs      = require('fs'),
    util    = require(__dirname + '/../util'),
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
                    description: ('Please specify username').green,
                    pattern: /\w{1,20}/
                });
            }
            if (!hasPassword) {
                promptConfigs.push({
                    name: 'password',
                    hidden: true,
                    password: true,
                    description: ('Please specify svn password').green,
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
                    if (err) {
                        console.log('Error: cancelled by user.');
                        return;
                    }
                    var data = JSON.stringify({
                        'username': inputs.username || userConfigs.username,
                        'password': inputs.password || ''
                    }, null, 4);

                    fs.writeFile(userConfigFile, data, 'utf8', function(err) {
                        if (err) {
                            throw err;
                        }
                        util.print('success', 'set', '%s is saved to "%s"', inputs.username, userConfigFile);
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
