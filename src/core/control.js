var fs = require('fs'),
    chalk = require('chalk'),
    api,
    path = require('path'),
    homeFolder = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

api = module.exports = function() {
    return {
        username: function(fn) {
            fn = fn || function() {};
            var prompt;
            var userConfigFile = homeFolder + '/.ia/user.config.json',
                userConfigs,
                hasUsername = false;

            if (fs.existsSync(userConfigFile)) {
                userConfigs = require(userConfigFile);
                hasUsername = !!userConfigs.username;
                fn(userConfigs.username);
            }

            if (!hasUsername) {
                prompt = require('prompt');
                prompt.get([{
                    name: 'username',
                    required: true,
                    description: 'Please specify username',
                    pattern: /\w{1,20}/
                }],
                function(err, inputs) {
                    var data = JSON.stringify({'username': inputs.username}, null, 4);

                    if (!fs.existsSync(path.dirname(userConfigFile))) {
                        fs.mkdirSync(path.dirname(userConfigFile));
                    }

                    fs.writeFile(userConfigFile, data, 'utf8', function(err) {
                        if (err) {
                            throw err;
                        }
                        console.log(chalk.green('SUCCESS\u0009(Set)\u0009') + '%s is saved to "%s"',
                                    inputs.username,
                                    userConfigFile);
                        fn(inputs.username);
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
