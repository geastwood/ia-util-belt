var exec = require('child_process').exec,
    IA = require(__dirname + '/../ia'),
    chalk = require('chalk'),
    prompt = require('prompt'),
    path = require('path'),
    svnBranch = require(__dirname + '/./svnBranch');

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
                var id = parseInt(whichBranchId.branchId, 10), branch = data[id - 1];
                if (id > data.length || typeof branch === 'undefined') {
                    console.error(chalk.red('INPUT INVALID: "%d" is out of range.'), id);
                }
                options.branchName = branch.branch;
                svnCheckoutCommand(options);
            });
        });
    }

};

var svnCheckoutCommand = function(options) {
    var spawn = require('child_process').spawn,
        child,
        svnUrl;

    if (options.branchName) {
        svnUrl = IA(options.appConfig).svn.getUserBranchFolder() + 'branches/' + options.branchName;
    } else { // ^\trunk
        svnUrl = IA(options.appConfig).svn.getUserBranchFolder() + 'trunk';
    }

    child = spawn('svn', [
        'checkout',
        svnUrl,
        path.join(IA(options.appConfig).path.getAppPath(), options.appDirectory)
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
        var fs = require('fs'),
            userConfigCallback,
            importantConfigCallback,
            logFile = path.join(IA(options.appConfig).path.getAppPath(), options.appDirectory, 'log');

        if (options.appConfig.app === 'service') { // frontend of service
            fs.chmod(logFile, '0777', function(err) {
                if (err) {
                    throw err;
                }
                console.log(chalk.green('SUCCESS\u0009(UPDATED)\u0009') + 'chmod 0777 of "%s"', logFile);
            });
        } else {
            userConfigCallback = require(__dirname + '/../plugin/userConfigPHP');
            importantConfigCallback = require(__dirname + '/../plugin/importantConfigPhp');
            importantConfigCallback.copy(path.join(IA(options.appConfig).path.getAppPath(),
                                              options.appDirectory, 'legacy', 'config', 'user'
                                             ));
            userConfigCallback.copy(path.join(IA(options.appConfig).path.getAppPath(),
                                              options.appDirectory, 'legacy', 'config', 'user'
                                             ));
        }
        console.log('\n');
        console.log(chalk.green('SUCCESS\u0009(INFO)\u0009') + 'Checkout successfully to "%s"',
                    path.join(IA(options.appConfig).path.getAppPath(), options.appDirectory));
        console.log('\n');
    });
};

module.exports.checkout = checkout;
module.exports.getBranches = svnGetBranches;

