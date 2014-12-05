#!/usr/bin/env node

// currentFolder = process.cwd()

var baseUrl = __dirname,
    program = require('commander'),
    chalk = require('chalk'),
    pkg = require(__dirname + '/package.json'),
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
program.option('-f --frontend', 'frontend flag');
program.option('-s --service', 'service flag');
program.option('-t --trunk', 'use trunk');
program.option('-r --release', 'use release');
program.option('-c --current', 'use current');

var parseGlobal = function(options) {
    return {
        app: options.parent.service ? 'service' : 'frontend',
        branch: options.parent.release ? 'release' : options.parent.current ? 'current' : 'trunk'
    };
};

                /*****************/
                /* CLI INTERFACE */
                /*****************/
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

program.command('branch <cmd>')
    .description('svn branch commands [ls|checkout]')
    .action(function(cmd, options) {
        var globals = parseGlobal(options),
            commands = require(__dirname + '/src/branch');

        commands[cmd](globals);
    });

program.parse(process.argv);
