var exec        = require('child_process').exec,
    chalk       = require('chalk'),
    prompt      = require('prompt'),
    svnBranch   = require(__dirname + '/./core/svnBranch'),
    coreBranch  = require(__dirname + '/./core/branch'),
    IA          = require(__dirname + '/./ia');

var commands = {
    'switch': function(globals) {
        var branches;

        if (IA(globals).util.isTruckFolder(process.cwd())) {
            console.log(chalk.red('ATTENSTION: It\'s not cool to switch the ' + chalk.underline('"trunk"') + '.'));
            return;
        }

        coreBranch.svnGetBranches(IA(globals).svn.getBranchFolder(), function(stdout, stdin) {
            var data;
            branches = new svnBranch.Branches(stdout);
            (data = branches.format()).forEach(function(branch) {
                console.log('%s\u0009%s\u0009%s', chalk.green(branch.prefix), branch.date, branch.branch);
            });
            prompt.get([{
                name: 'branchId',
                description: 'Which to switch?',
                default: 1,
                pattern: /\d{1,2}/
            }],
            function(err, prompts) {
                var id = parseInt(prompts.branchId, 10), branch = data[id - 1];
                if (id > data.length || typeof branch === 'undefined') {
                    console.error(chalk.red('INPUT INVALID: "%d" is out of range.'), id);
                }
                prompt.get([{
                    name: 'yesno',
                    message: 'sure to switch to "' + branch.branch + '"?',
                    validator: /y[es]*|n[o]?/,
                    warning: 'Must respond yes or no',
                    default: 'no'
                }], function(err, prompts) {
                    var child;
                    if (prompts.yesno === 'yes') {
                        child = exec('svn switch ' + IA(globals).svn.getUserBranchFolder() + 'branches/' + branch.branch,
                                     function() {}
                                    );
                        child.stdout.on('data', function(data) {
                            console.log(data);
                        });
                        child.on('exit', function() {
                            exec('svn info', function(err, stdout) {
                                console.log(stdout);
                                console.log(chalk.green('SUCCESS: now switched to %s'), branch.branch);
                            });
                        });
                    } else {
                        console.log(chalk.green('ATTENSTION: Action is cancelled, nothing changed.'));
                    }
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
