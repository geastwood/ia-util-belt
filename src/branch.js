var sys = require('sys'),
    exec = require('child_process').exec,
    path = require('path'),
    chalk = require('chalk'),
    prompt = require('prompt'),
    svnBranch = require(__dirname + '/./svnBranch'),
    IA = require(__dirname + '/./ia');

var commands = {
    ls: function(globals, opts) {
        var frontendBranches = new svnBranch.LocalBranches(IA({app: 'frontend'}).path.getAppPath(), 'frontend');
        var serviceBranches = new svnBranch.LocalBranches(IA({app: 'service'}).path.getAppPath(), 'service');
        var count = 1, data = [];

        console.log('\n========FRONTEND===============');
        frontendBranches.format().forEach(function(file) {
            file.app = 'frontend';
            data.push(file);
            console.log(chalk.green('#%d\u0009%s\u0009') + file.filename + '\u0009\u0009' + file.path, count++, 'FRONTEND');
        });
        console.log('===============================');
        console.log('\n========SERVICE================');
        serviceBranches.format().forEach(function(file) {
            file.app = 'service';
            data.push(file);
            console.log(chalk.green('#%d\u0009%s\u0009') + file.filename + '\u0009\u0009' + file.path, count++, 'SERVICE ');
        });
        console.log('===============================');
    },
    'switch': function(globals) {
        var branches;

        if (IA(globals).util.isTruckFolder(process.cwd())) {
            console.log(chalk.red('ATTENSTION: It\'s not cool to switch the ' + chalk.underline('"trunk"') + '.'));
            return;
        }

        svnGetBranches(IA(globals).svn.getBranchFolder(), function(stdout, stdin) {
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
                        child = exec('svn switch ' + IA(globals).svn.getUserBranchFolder() + 'branches/' + branch.branch, function() {});
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
    current: function(globals) {
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
    },
    checkout: function(globals) {
        prompt.get([{
            name: 'app',
            description: 'frontend or backend?',
            default: 'frontend',
            pattern: /(frontend|backend)/
        }],
        function(err, inputs) {
            var branches, data;
            svnGetBranches(IA(globals).svn.getBranchFolder(), function(stdout) {
                branches = new svnBranch.Branches(stdout);
                (data = branches.format()).forEach(function(branch) {
                    console.log('%s\u0009%s\u0009%s', chalk.green(branch.prefix), branch.date, branch.branch);
                });
                prompt.get([{
                    name: 'branchId',
                    description: 'Which to checkout?',
                    default: 1,
                    pattern: /\d{1,2}/
                }, {
                    name: 'name',
                    description: 'folder name?',
                    pattern: /\w{1,50}/
                }],
                function(err, inputs) {
                    var id = parseInt(inputs.branchId, 10), branch = data[id - 1], child;
                    if (id > data.length || typeof branch === 'undefined') {
                        console.error(chalk.red('INPUT INVALID: "%d" is out of range.'), id);
                    }

                    var spawn = require('child_process').spawn;

                    child = spawn('svn', [
                        'checkout',
                        IA(globals).svn.getUserBranchFolder() + 'branches/' + branch.branch,
                        path.join(IA(globals).path.getAppPath(), inputs.name)
                    ]);

                    child.stdout.setEncoding('utf8');
                    child.stdout.on('data', function(data) {
                        console.log(data);
                    });
                    child.stderr.setEncoding('utf8');
                    child.stderr.on('data', function(data) {
                        console.log(chalk.red('ERROR: ' + data));
                    });
                    child.on('exit', function() {
                        var fs = require('fs');
                        var logFile = path.join(IA(globals).path.getAppPath(), inputs.name, 'log')
                        fs.chmod(logFile, '0777', function(err) {
                            if (err) {
                                throw err;
                            }
                            console.log(chalk.green('SUCCESS: chmod 0777 of %s'), logFile);
                        });
                        console.log(chalk.green('\ncheckout finished'));
                    });
                });
            });

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
