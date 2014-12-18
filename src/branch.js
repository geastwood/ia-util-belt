var prompt      = require('prompt'),
    coreBranch  = require(__dirname + '/core/branch'),
    IA          = require(__dirname + '/ia');

var commands = {
    'switch': function() {
        prompt.get([{ // trunk | current | release
            name: 'branch',
            description: ('Which branch to switch?').green,
            required: true,
            'default': 'current',
            pattern: /(current|release)/
        }],
        function(err, whichBranch) { // path of the app
            if (err) {
                console.log('Error: cancelled by user.');
                return;
            }
            prompt.get([{
                name: 'app',
                description: ('frontend or service?').green,
                'default': 'frontend',
                pattern: /(frontend|service)/
            }],
            function(err, whichApp) {
                if (err) {
                    console.log('Error: cancelled by user.');
                    return;
                }
                coreBranch.switchBranch({
                    app: whichApp.app,
                    branch: whichBranch.branch
                });
            });
        });
    },
    checkout: function(options) {
        prompt.get([{
            name: 'folder',
            description: ('Folder name under "' + IA().path.getRootPath() + '"').green,
            required: true,
            pattern: /\w{1,20}/
        }],
        function(err, whereApp) { // path of the app
            if (err) {
                console.log('Error: cancelled by user.');
                return;
            }
            prompt.get([{
                name: 'app',
                description: ('frontend or service?').green,
                'default': 'frontend',
                pattern: /(frontend|service)/
            }],
            function(err, whichApp) {
                if (err) {
                    console.log('Error: cancelled by user.');
                    return;
                }
                coreBranch.checkout({
                    isTrunk: options.trunk === true,
                    appConfig: {app: whichApp.app},
                    appDirectory: whereApp.folder
                });
            });
        });
    },
    update: function() {
        prompt.get([{ // trunk | current | release
            name: 'branch',
            description: ('Which branch to update?').green,
            required: true,
            'default': 'trunk',
            pattern: /(trunk|current|release)/
        }],
        function(err, whichBranch) { // path of the app
            if (err) {
                console.log('Error: cancelled by user.');
                return;
            }
            coreBranch.update(whichBranch);
        });
    }
};

module.exports = commands;
