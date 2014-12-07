#!/usr/bin/env node

var baseUrl = __dirname,
    program = require('commander'),
    chalk = require('chalk'),
    prompt = require('prompt'),
    pkg = require(__dirname + '/package.json'),
    control = require(__dirname + '/src/core/control'),
    folder = require(__dirname + '/src/core/folder'),
    IA = require(__dirname + '/src/ia');

// provide the version from package.json
program.version('Current version: ' + pkg.version);

                /***************/
                /* GLOBAL FLAG */
                /***************/
/**
 * default to 'frontend' [frontend|service]
 * default to 'truck' [trunk|release|current|..]
 */
// program.option('-f --frontend', 'frontend flag');
// program.option('-s --service', 'service flag');
// program.option('-t --trunk', 'use trunk');
// program.option('-r --release', 'use release');
// program.option('-c --current', 'use current');

var parseGlobal = function(options) {
    return {
        app: options.parent.service ? 'service' : 'frontend',
        branch: options.parent.release ? 'release' : options.parent.current ? 'current' : 'trunk'
    };
};

                    /**********/
                    /* HELPER */
                    /**********/
var yesno = function(fn, opts) {
    var answer = 'no';
    opts = opts || {};

    prompt.get([{
        name:   'yesno',
        message: opts.message || 'continue?',
        validator: /(yes|no)/,
        'default': opts['default'] || 'yes'
    }], function(err, inputs) {
        answer = inputs.yesno;
        fn(answer);
    });
};

                /*****************/
                /* CLI INTERFACE */
                /*****************/
program
    .command('setup')
    .description('walk thought some very basic setup steps')
    .action(function(options) {
        console.log('\nThis process will run initial setups, save username, create folder struceture.\n');
        yesno(function(answer) {
            if (answer === 'no') {
                console.log(chalk.blue('INFO\u0009(CANCELLED BY USER)') + '\u0009%sNo demage is done.');
                return;
            }
            control().username(function(username) {
                console.log(chalk.blue('INFO\u0009(DISPLAY)') + '\u0009Username is "%s"', username);
                yesno(function(toCreateFolder) {
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
program.command('branch [cmd]')
    .description('svn branch commands [ls|checkout|switch]')
    .option('-g --go', 'To go to specified branch')
    .action(function(cmd, options) {
        var globals = parseGlobal(options),
            commands = require(__dirname + '/src/branch');

        if (!cmd)
            cmd = 'ls';
        commands[cmd](globals, options);
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
        var build = require(__dirname + '/src/core/build'),
            config = {app: null, branch: null, flag: null},
            groups = {
                app: {
                    options: ['frontend', 'service'],
                    'default': 'frontend'
                },
                branch: {
                    options: ['trunk', 'release', 'current'],
                    'default': 'trunk'
                },
                flag: {
                    options: ['part', 'development', 'legacy', 'serviceclient', 'module'],
                    'default': null
                }
            };
        Object.keys(groups).forEach(function(key) {
            var found = false;
            groups[key].options.forEach(function(option) {
                if (options[option]) {
                    config[key] = option;
                    found = true;
                }
            });
            if (!found) {
                config[key] = groups[key]['default'];
            }
        });

        build.build(config);
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
        var watch = require(__dirname + '/src/core/watch');
        watch().watch();
    });

program.parse(process.argv);
/*
program
    .command('devmode <cmd>')
    .description('[on|off|toggle|is] switch dev mode')
    .action(function(cmd, opts) {
        var globals = parseGlobal(opts),
            iniFile = IA(globals).path.getAppIni(),
            devmode = require(baseUrl + '/src/devmode')(iniFile);

        if (cmd === 'is') {
            devmode.read(function(err, data) {
                if (err) {
                    throw err;
                }
                devmode.log(data.isOn);
            });
        } else {
            devmode.update(cmd, function(err, data) {
                if (err) {
                    throw err;
                }
                devmode.log(data.isOn);
            });
        }
    });

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

program.command('buildconfig')
    .description('build config related commands')
    .option('-g --grep <string>', 'Search a file')
    .option('-d --delete', 'To delete')
    .option('-m --module', 'Do action on module build config file')
    .action(function(options) {
        var globals = parseGlobal(options),
            paths = {
                component: IA.path(globals).getComponentBuildConfig(),
                module: IA.path(globals).getModuleBuildConfig()
            },
            buildConfig = require(baseUrl + '/src/buildconfig')(paths[(options.module ? 'module': 'component')]);

        if (options.search) {
            buildConfig.findFile(options.search, {toRemove: options.remove});
        }
    });

program.command('find <pattern>')
    .description('a `grep` wrapper')
    .option('-d --definition', 'search only ext.define, e.g. Ext.define(\'IA.util.SomeClass\')')
    .action(function(pattern, options) {
        var globals = parseGlobal(options),
            sys = require('sys'),
            exec = require('child_process').exec,
            child;

        if (options['class']) {
            pattern = 'Ext\\d?\\.define\\(.*' + pattern;
        }
        // TODO, may add path
        // search recursively and case-insensitive
        child = exec('egrep -iR "' + pattern + '" . ' +
             '--exclude-dir library ' +
             '--exclude-dir legacy ' +
             '--exclude-dir node_modules ' +
             '--exclude-dir tests ' +
             '--exclude-dir test ' +
             '--exclude-dir build',
        function(err, stdout, stdin) {
            // give a green color of outputs
            var formated = stdout.replace((new RegExp(pattern, 'gmi')), function(match) {
                return chalk.green(match);
            });

            sys.puts(formated);
        });
    });


program.parse(process.argv);
*/
