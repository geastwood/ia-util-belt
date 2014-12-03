var sys = require('sys'),
    exec = require('child_process').exec,
    chalk = require('chalk'),
    prompt = require('prompt'),
    IA = require(__dirname + '/./ia');

var commands = {
    ls: function() {
        var repo = IA.svn.getBranchFolder();

        svnGetBranches(repo, function(stdout, stdin) {
            sys.puts(chalk.green('===================FRONTEND BRANCHES================'));
            sys.puts(stdout);
            sys.puts(chalk.green('===================================================='));
        });

    },
    'switch': function() {
        var branches;

        if (IA.util.isTruckFolder(process.cwd())) {
            console.log(chalk.red('ATTENSTION: It\'s not cool to switch the ' + chalk.underline('"trunk"') + '.'));
            return;
        }

        svnGetBranches(IA.svn.getBranchFolder(), function(stdout, stdin) {
            var data;
            branches = new Branches(stdout);
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

/**********/
/* BRANCH */
/**********/
var Branches = function(raw) {
    this.raw = raw;
    this.lines = [];
};

Branches.prototype.collect = function() {
    var folderReg = /[^.]\/$/, raw = this.raw;

    if (this.lines.length === 0) {
        this.lines = raw.split('\n').map(function(line) {
            line = line.trim();
            if (folderReg.test(line)) {
                return new BranchInfo(line);
            }
            return null;
        }).filter(function(line) {
            return line !== null;
        });
    }
    return this.lines;
};
Branches.prototype.getRawOuput = function() {
    return this.raw;
};
Branches.prototype.format = function() {
    var prefix = 'Branch #';
    if (this.lines.length === 0) {
        this.collect();
    }
    return this.lines.map(function(line) {
        var month = line.getByName('month'),
            day = line.getByName('day'),
            year = line.getByName('time');

        year = year.indexOf(':') === -1 ? year : (new Date()).getFullYear();

        return {branch: line.getByName('branch'), date: [month, day, year].join(' ')};
    }).sort(function(a, b) {
        return Date.parse(b.date) - Date.parse(a.date);
    }).map(function(entry, count) {
        count += 1;

        return {prefix: prefix + count, branch: entry.branch, date: entry.date};
    });
};

var BranchInfo = function(line) {
    this.line = line;
    this.parts = [];
};

BranchInfo.prototype.getByName = function(name) {
    var rst = null;
    if (this.parts.length === 0) {
        this.parse();
    }
    this.parts.some(function(part) {
        if (part.name === name) {
            rst = part.value;
            return true;
        }
    });

    return rst;
};

BranchInfo.prototype.parse = function() {
    var parts, columns;
    if (this.parts.length > 0) {
        return this.parts;
    } else {
        parts = this.line.split(/\s+/).map(function(part) {
            return part.trim();
        });
        columns = ['revision', 'author', 'month', 'day', 'time', 'branch'];
        this.parts = columns.map(function(column, i) {
            return { name: column, value: parts[i] };
        });
        return this.parts;
    }
};

module.exports = commands;
