#!/usr/bin/env node

var baseUrl = __dirname,
    currentFolder = process.cwd(),
    program = require('commander'),
    chalk = require('chalk'),
    pkg = require(__dirname + '/package.json'),
    IA = require(__dirname + '/src/ia');

// provide the version from package.json
program.version('Current version: ' + pkg.version);

program
    .command('devmode <cmd>')
    .description('[on|off|toggle|is] switch dev mode')
    .action(function(cmd) {
        var path = IA.path.getAppIni();
        var devmode = require(baseUrl + '/src/devmode')(path);
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
    .option('-p --path <path>', 'specify the path optionally')
    .action(function(options) {
        var sys = require('sys'),
            exec = require('child_process').exec,
            path;
        exec("svn diff " + (options.path ? options.path : ".") + "| colordiff", function(err, stdout, stdin) {
            sys.puts(stdout);
        });
    });

program.command('jira')
    .description('jira command')
    .option('-t --ticket <number>', 'ticket number')
    .action(function(option) {
        var url = IA.jira.getTicketView(), exec = require('child_process').exec, child;

        if (option.ticket) {
            url = url + option.ticket;
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
    .option('-s --search <string>', 'Search a file')
    .option('-r --remove', 'To remove')
    .option('-m --module', 'Do action on module build config file')
    .action(function(options) {
        var path = {
            component: IA.path.getComponentBuildConfig(),
            module: IA.path.getModuleBuildConfig()
        },
        buildConfig = require(baseUrl + '/src/buildconfig')(path[(options.module ? 'module': 'component')]);

        if (options.search) {
            buildConfig.findFile(options.search, {toRemove: options.remove});
        }
    });

program.command('find <pattern>')
    .description('a `grep` wrapper')
    .option('-c --class', 'search only class, e.g. Ext.define(\'IA.util.SomeClass\')')
    .action(function(pattern, options) {
        var sys = require('sys'),
            exec = require('child_process').exec,
            child;

        if (options['class']) {
            pattern = 'Ext\\d?\\.define\\(.*' + pattern;
        }

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
    .action(function(cmd) {
        var commands = require(__dirname + '/src/branch');

        commands[cmd]();

    });

program.parse(process.argv);
