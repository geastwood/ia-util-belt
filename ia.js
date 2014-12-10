#!/usr/bin/env node

var program = require('commander'),
    chalk   = require('chalk'),
    pkg     = require(__dirname + '/package.json'),
    control = require(__dirname + '/src/core/control'),
    folder  = require(__dirname + '/src/core/folder'),
    util    = require(__dirname + '/src/util'),
    IA      = require(__dirname + '/src/ia');

// provide the version from package.json
program.version('Current version: ' + pkg.version);

                /*****************/
                /* CLI INTERFACE */
                /*****************/
program
    .command('devDep')
    .action(function() {
        var devDep = require(__dirname + '/src/core/envDependencies');
        util.yesno(function(answer) {
            if (answer === 'no') {
                console.log(chalk.blue('INFO\u0009(CANCELLED BY USER)') + '\u0009%sNo demage is done.');
                return;
            }
            devDep().install();
        });
    });
program
    .command('setup')
    .description('walk thought some very basic setup steps')
    .action(function(options) {
        console.log('\nThis process will run initial setups, save username, create folder struceture.\n');
        util.yesno(function(answer) {
            if (answer === 'no') {
                console.log(chalk.blue('INFO\u0009(CANCELLED BY USER)') + '\u0009%sNo demage is done.');
                return;
            }
            control().username(function(username) {
                console.log(chalk.blue('INFO\u0009(DISPLAY)') + '\u0009Username is "%s"', username);
                util.yesno(function(toCreateFolder) {
                    if (toCreateFolder === 'no') {
                        console.log(chalk.blue('INFO\u0009(CANCELLED BY USER)') + '\u0009%sNo demage is done.');
                        return;
                    }
                    folder().createFolder();
                    console.log(chalk.green('SUCCESS\u0009(PROCESS FINISHED)'));
                }, {message: 'create folder structure?'});
            });
        });
    });

    // Branch
program.command('branch <cmd>')
    .description('svn branch commands [checkout|switch]')
    .option('-t --trunk', 'Checkout trunk')
    .action(function(cmd, options) {
        var commands = require(__dirname + '/src/branch');

        if (['checkout', 'switch'].indexOf(cmd) < 0) {
            console.log(chalk.red('INFO\u0009(WRONG INPUT)\u0009') + '%s', 'Only option `checkout` and `switch` is valid');
        } else {
            commands[cmd](options);
        }
    });

    // build
program.command('build')
    .description('Build process releated command')
    .option('-f --frontend',        'frontend flag')
    .option('-s --service',         'service flag')
    .option('-t --trunk',           'use trunk')
    .option('-r --release',         'use release')
    .option('-c --current',         'use current')
    .option('-p --part',            'part')
    .option('-d --development',     'development')
    .option('-l --legacy',          'legacy')
    .option('-s --serviceclient',   'serviceclient')
    .option('-m --module',          'module')
    .action(function(options) {
        var build = require(__dirname + '/src/build'),
            util = require(__dirname + '/src/util');

        build.build(util.parseGlobal(options));
    }).on('--help', function() {
        console.log(chalk.green.bold('  Details'));
        console.log('\n');
        console.log(chalk.green('    `-f` and `-s` stand for `frontend` and `service`'));
        console.log(chalk.green('    `-t`, `-c` and `-r` stand for `trunk`, `current` and `release`'));
        console.log(chalk.green('\n    Please free composite these options!'));
        console.log('    -------------------------------------');
        console.log('    %s    %s', '-ftd', 'frontend  trunk  development');
        console.log('    %s    %s', '-ftp', 'frontend  trunk  part');
        console.log('    %s    %s', '-ftl', 'frontend  trunk  legacy');
        console.log('    %s    %s', '-fts', 'frontend  trunk  serviceclient');
        console.log('    %s    %s', '-ftm', 'frontend  trunk  modules');
        console.log('    -------------------------------------');
        console.log('    %s    %s', '-fcd', 'frontend current development');
        console.log('    %s    %s', '-fcp', 'frontend current part');
        console.log('    %s    %s', '-fcl', 'frontend current legacy');
        console.log('    %s    %s', '-fcs', 'frontend current serviceclient');
        console.log('    %s    %s', '-fcm', 'frontend current modules');
        console.log('    -------------------------------------');
        console.log('    %s    %s', '-frd', 'frontend release development');
        console.log('    %s    %s', '-frp', 'frontend release part');
        console.log('    %s    %s', '-frl', 'frontend release legacy');
        console.log('    %s    %s', '-frs', 'frontend release serviceclient');
        console.log('    %s    %s', '-frm', 'frontend release modules');
        console.log('    -------------------------------------');
        console.log('    %s    %s', '-st',  'service  release');
        console.log('    %s    %s', '-sc',  'service  release');
        console.log('    %s    %s', '-sr',  'service  release');
        console.log('    -------------------------------------');
    });

program.command('watch')
    .description('small watch function')
    .option('-t --trunk',           'use trunk')
    .option('-r --release',         'use release')
    .option('-c --current',         'use current')
    .action(function(options) {
        var util = require(__dirname + '/src/util'),
            watcher = require(__dirname + '/src/watch');
        watcher().watch(util.parseGlobal(options));
    });

program
    .command('devmode <cmd>')
    .description('[on|off|is] switch dev mode')
    .option('-t --trunk',   'use trunk')
    .option('-r --release', 'use release')
    .option('-c --current', 'use current')
    .action(function(cmd, options) {
        var util = require(__dirname + '/src/util'),
            iniFile = IA(util.parseGlobal(options)).path.getAppIni(),
            devmode = require(__dirname + '/src/devmode')(iniFile);

        if (cmd === 'is') {
            devmode.read(function(err, data) {
                if (err) {
                    throw err;
                }
                devmode.log(data.isOn, iniFile);
            });
        } else {
            devmode.update(cmd, function(err, data) {
                if (err) {
                    throw err;
                }
                devmode.log(data.isOn, iniFile);
            });
        }
    })
    .on('--help', function() {
        console.log(chalk.green.bold('  Example:\n'));
        console.log(chalk.green('    ia devmode -t is') + '\u0009\u0009 check current `dev mode` of frontend `trunk`');
        console.log(chalk.green('    ia devmode --release on') + '\u0009 turn on `dev mode` of frontend `current`');
        console.log(chalk.green('    ia devmode -c off') + '\u0009\u0009 turn off `dev mode` of frontend `current`');
    });

program.command('buildconfig')
    .description('build config related commands')
    .option('-g --grep <string>', 'Search a file')
    .option('-d --delete', 'To delete')
    .option('-m --module', 'Do action on module build config file')
    .option('-t --trunk',   'use trunk')
    .option('-r --release', 'use release')
    .option('-c --current', 'use current')
    .action(function(options) {
        var util = require(__dirname + '/src/util'),
            globals = util.parseGlobal(options),
            paths = {
                component: IA(globals).path.getComponentBuildConfig(),
                module: IA(globals).path.getModuleBuildConfig()
            },
            buildConfig = require(__dirname + '/src/buildconfig')(paths[(options.module ? 'module': 'component')]);

        if (options.grep) {
            buildConfig.findFile(options.grep, {toRemove: options['delete']});
        }
    });

program.command('find <pattern>')
    .description('a `grep` wrapper')
    .option('-d --definition', 'search only ext.define, e.g. Ext.define(\'IA.util.SomeClass\')')
    .option('-f --frontend',   'frontend flag')
    .option('-s --service',    'service flag')
    .option('-t --trunk',      'use trunk')
    .option('-r --release',    'use release')
    .option('-c --current',    'use current')
    .action(function(pattern, options) {
        var spawn = require('child_process').spawn,
            child,
            targetPath = IA(util.parseGlobal(options)).path.getBasePath();

        if (options['definition']) {
            pattern = 'Ext\\d?\\.define\\(.*' + pattern;
        }

        // search recursively and case-insensitive
        console.log('\n');
        console.log(chalk.blue('INFO\u0009(SEARCH)\u0009') + 'Searching under "%s"', targetPath);
        console.log('\n');

        child = spawn('egrep', [
            '-i', '-R',
            pattern,
            targetPath,
            '--exclude-dir', 'library',
            '--exclude-dir', 'legacy',
            '--exclude-dir', 'node_modules',
            '--exclude-dir', 'tests',
            '--exclude-dir', 'test',
            '--exclude-dir', 'build',
        ]);
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', function(stdout) {
            // give a green color of outputs
            var formated = stdout.replace((new RegExp(pattern, 'gmi')), function(match) {
                return chalk.green(match);
            });

            console.log(formated.replace(new RegExp(targetPath, 'gmi'), '--'));
        });
    });

var apacheOptions = ['start', 'stop', 'graceful-stop','restart','reload',
    'force-reload','start-htcacheclean','stop-htcacheclean','status'];
program.command('apache <cmd>')
    .description('apache 2 commands')
    .action(function(cmd) {
        var exec = require('child_process').exec, child;
        if (apacheOptions.indexOf(cmd) < 0) {
            console.log(chalk.red('ERROR\u0009(WRONG COMMAND)\u0009') + '%s', 'Invalid option, only ' + apacheOptions.join('|'));
        }
        child = exec('service apache2 ' + cmd);
        child.stdout.on('data', function(data) {
            console.log(data);
        });
    }).on('--help', function() {
        console.log(chalk.green.bold('  Available commands:'));
        console.log(' ');
        console.log(apacheOptions.map(function(option) {
            return '    * ' + option;
        }).join('\n'));
        console.log(' ');
    });

program.parse(process.argv);

/*
program.command('diff').
    description('svn diff')
    .option('-d --dir <dir>', 'specify the dir optionally')
    .action(function(options) {
        var globals = parseGlobal(options),
            sys = require('sys'),
            exec = require('child_process').exec;
        exec("svn diff " + (options.dir ? options.dir : ".") + "| colordiff", function(err, stdout, stdin) {
            sys.puts(stdout);
        });
    });

program.command('ticket')
    .description('ticket commands')
    .option('-n --number <number>', 'ticket number')
    .action(function(options) {
        var globals = parseGlobal(options),
            url = IA(globals).jira.getTicketView(),
            exec = require('child_process').exec,
            child;

        if (options.number) {
            url = url + options.number;
        }

        child = exec("open " + url, function(err, stdout, stdin) {
            if (err) {
                throw err;
            }
        });
        child.on('exit', function() {
            console.log('New tab is opened');
        });
    });

program.parse(process.argv);
*/
