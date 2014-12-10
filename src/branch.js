var prompt      = require('prompt'),
    coreBranch  = require(__dirname + '/core/branch'),
    IA          = require(__dirname + '/ia');

var commands = {
    'switch': function(globals) {
        // if (IA(globals).util.isTruckFolder(process.cwd())) {
        //     console.log(chalk.red('ATTENSTION: It\'s not cool to switch the ' + chalk.underline('"trunk"') + '.'));
        //     return;
        // }
        prompt.get([{ // trunk | current | release
            name: 'branch',
            description: 'Which branch to switch?',
            required: true,
            'default': 'current',
            pattern: /(current|release)/
        }],
        function(err, whichBranch) { // path of the app
            prompt.get([{
                name: 'app',
                description: 'frontend or service?',
                'default': 'frontend',
                pattern: /(frontend|service)/
            }],
            function(err, whichApp) {
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
            description: 'Folder name under "' + IA().path.getRootPath() + '"',
            required: true,
            pattern: /\w{1,20}/
        }],
        function(err, whereApp) { // path of the app
            prompt.get([{
                name: 'app',
                description: 'frontend or service?',
                'default': 'frontend',
                pattern: /(frontend|service)/
            }],
            function(err, whichApp) {
                coreBranch.checkout({
                    isTrunk: options.trunk === true,
                    appConfig: {app: whichApp.app},
                    appDirectory: whereApp.folder
                });
            });
        });
    }
};

module.exports = commands;
