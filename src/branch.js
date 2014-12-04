var sys = require('sys'),
    exec = require('child_process').exec,
    chalk = require('chalk'),
    prompt = require('prompt'),
    svnBranch = require(__dirname + '/./svnBranch'),
    IA = require(__dirname + '/./ia');

var commands = {
    ls: function() {
        var repo = IA.svn.getBranchFolder();
        console.log(repo);

        svnGetBranches(repo, function(stdout, stdin) {
            sys.puts(chalk.green('===================FRONTEND BRANCHES================'));
            sys.puts(stdout);
            sys.puts(chalk.green('===================================================='));
        });

    },
    'switch': function() {
        var branches, that = this;

        if (IA.util.isTruckFolder(process.cwd())) {
            console.log(chalk.red('ATTENSTION: It\'s not cool to switch the ' + chalk.underline('"trunk"') + '.'));
            return;
        }

        svnGetBranches(IA.svn.getBranchFolder(), function(stdout, stdin) {
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
                        child = exec('svn switch ' + IA.svn.getUserBranchFolder() + 'branches/' + branch.branch, function() {});
                        child.stdout.on('data', function(data) {
                            sys.puts(data);
                        });
                        child.on('exit', function() {
                            exec('svn info', function(err, stdout) {
                                sys.puts(stdout);
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
    current: function() {
        exec('svn info', function(err, stdout) {
            var branchInfo;
            if (err) {
                throw err;
            }
            branchInfo = new svnBranch.BranchInfo(stdout);
            sys.puts(chalk.green('===================CURRENT BRANCH==================='));
            console.log('\n');
            console.log(chalk.green.bold("Current Branch is %s"), branchInfo.getByName('relativeUrl')[0].value);
            console.log('\n');
            sys.puts(chalk.green('===================DETAIL==========================='));
            console.log('\n');
            console.log(stdout);
            sys.puts(chalk.green('===================================================='));
        });
    }
};

/**
 * Get branches from svn
 */
var svnGetBranches = function(repo, fn) {
    var child;

    child = exec('svn ls ' + repo + ' --verbose', function(err, stdout, stdin) {
        if (err) {
            throw err;
        }
        fn(stdout, stdin);
    });

    child.on('exit', function(err) {
        if (err) {
            throw 'error error while connecting to svn server';
        }
    });

    return child;
};

module.exports = commands;
