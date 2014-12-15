var exec        = require('child_process').exec,
    IA          = require(__dirname + '/../ia'),
    chalk       = require('chalk'),
    prompt      = require('prompt'),
    path        = require('path'),
    util        = require(__dirname + '/../util'),
    svnBranch   = require(__dirname + '/./svnBranch');

/**
 * Get branches from svn
 */
var svnGetBranches = function(repo, fn) {
    var child;

    child = exec('svn ls ' + repo + ' --verbose ' + IA().util.getSvnCommandFlags(), function(err, stdout, stdin) {
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

/**
 * @param {Object} options data needed for checkout a repo
 *                         options.isTrunk {Boolean}
 *                         options.appConfig {Object}
 *                         options.appConfig.app {String} frontend | backend
 *
 * @return {Undefined}
 */
var checkout = function(options) {
    var branches, data;

    if (options.isTrunk) {
        svnCheckoutCommand(options);
    } else {
        svnGetBranches(IA(options.appConfig).svn.getBranchFolder(), function(stdout) {
            branches = new svnBranch.Branches(stdout);
            (data = branches.format()).forEach(function(branch) {
                console.log('%s\u0009%s\u0009%s', chalk.green(branch.prefix), branch.date, branch.branch);
            });
            prompt.get([{
                name: 'branchId',
                description: 'Which to checkout?',
                default: 1,
                pattern: /\d{1,2}/
            }],
            function(err, whichBranchId) {
                if (err) {
                    console.log('Error: cancelled by user.');
                    return;
                }
                var id = parseInt(whichBranchId.branchId, 10), branch = data[id - 1];
                if (id > data.length || typeof branch === 'undefined') {
                    console.error(chalk.red('INPUT INVALID: "%d" is out of range.'), id);
                }

                // if checkout a `branch`, pass the information along
                options.branchName = branch.branch;
                svnCheckoutCommand(options);
            });
        });
    }

};

var switchBranch = function(options) {
    var branches;

    svnGetBranches(IA(options).svn.getBranchFolder(), function(stdout) {
        var data;
        branches = new svnBranch.Branches(stdout);
        (data = branches.format()).forEach(function(branch) {
            console.log('%s\u0009%s\u0009%s', chalk.green(branch.prefix), branch.date, branch.branch);
        });
        prompt.get([{
            name: 'branchId',
            description: 'Which to switch?',
            'default': 1,
            pattern: /\d{1,2}/
        }],
        function(err, prompts) {
            if (err) {
                console.log('Error: cancelled by user.');
                return;
            }
            var id = parseInt(prompts.branchId, 10), branch = data[id - 1];
            if (id > data.length || typeof branch === 'undefined') {
                console.error(chalk.red('INPUT INVALID: "%d" is out of range.'), id);
            }
            util.yesno(function(answer) {
                var child;
                if (answer === 'no') {
                    util.print('info', 'cancelled by user', 'Action is cancelled, nothing changed.');
                    return;
                }
                // MUST CHANGE TO FOLDER, AND SWITCH COMMAND
                process.chdir(IA(options).path.getBasePath());
                child = exec('svn switch ' + IA(options).svn.getUserBranchFolder() + 'branches/' + branch.branch + ' ' +
                             IA().util.getSvnCommandFlags(),
                             function() {});

                child.stdout.on('data', function(data) {
                    util.stdout(data);
                });
                child.on('exit', function() {
                    exec('svn info ' + IA().util.getSvnCommandFlags(), function(err, stdout) {
                        util.stdout(stdout);
                        util.print('success', 'switched', 'now switched to %s', branch.branch);
                    });
                });
            }, {
                message: 'sure to switch to "' + branch.branch + '"?'
            });
        });
    });

};

var svnCheckoutCommand = function(options) {
    var spawn = require('child_process').spawn,
        child,
        svnUrl,
        fs = require('fs'),
        targetPath = IA().path.calculateAppPath(options.appDirectory, options.appConfig.app);

    if (options.branchName) {
        svnUrl = IA(options.appConfig).svn.getUserBranchFolder() + 'branches/' + options.branchName;
    } else { // ^\trunk
        svnUrl = IA(options.appConfig).svn.getUserBranchFolder() + 'trunk';
    }

    // check the path, if not exists, create with flag '-p'
    if (!fs.existsSync(targetPath)) {
        spawn('mkdir', ['-p', targetPath]);
    }

    child = spawn('svn', [
        'checkout',
        svnUrl,
        targetPath,
        '--username',
        IA().util.getUser(),
        '--password',
        IA().util.getPassword(),
        '--no-auth-cache'
    ]);

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function(data) {
        util.stdout(data);
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function(data) {
        util.stdout(chalk.red('ERROR: ' + data));
    });
    child.on('exit', function() {
        var userConfigCallback,
            importantConfigCallback,
            logFile = path.join(targetPath, 'log'),
            appLogFile = path.join(logFile, 'application.log');

        if (options.appConfig.app === 'service') { // frontend of service
            fs.chmod(logFile, '0777', function(err) {
                if (err) {
                    throw err;
                }
                util.print('success', 'updated', 'chmod 0777 of "%s"', logFile);
                exec('touch ' + appLogFile + ' && chmod 0777 ' + appLogFile, function() {});
            });
        } else {
            userConfigCallback = require(__dirname + '/../plugin/userConfigPHP');
            importantConfigCallback = require(__dirname + '/../plugin/importantConfigPHP');
            importantConfigCallback.copy(path.join(targetPath, 'legacy', 'config', 'user'));
            userConfigCallback.copy(path.join(targetPath, 'legacy', 'config', 'user'));
        }
        console.log('\n');
        util.print('success', 'info', 'Checkout successfully to "%s"', path.join(targetPath));
    });
};

module.exports.checkout = checkout;
// module.exports.getBranches = svnGetBranches;
module.exports.switchBranch = switchBranch;
