#!/usr/bin/env node
/**
 * <arg> means required arg
 * [arg] means optional arg
 * action parameter correspond with `command` and `options`
 *
 */
var baseUrl = __dirname,
    currentFolder = process.cwd(),
    program = require('commander'),
    pkg = require(__dirname + '/package.json');

program.version('Current version: ' + pkg.version);

program
    .command('devmode <cmd>')
    .description('[on|off|toggle|is] switch dev mode')
    .action(function(cmd) {
        var path = '/Volumes/intelliAd/Frontend/trunk/application/configs/application.ini';
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
    .option('-p --path [path]', 'specify the path optionally')
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
    .option('-t --ticket [number]', 'ticket number')
    .action(function(option) {
        var url = 'http://jira.muc.intelliad.de/',
            exec = require('child_process').exec,
            child;
        if (option.ticket) {
            url = url + 'browse/' + option.ticket;
        }

        child = exec("open " + url, function(err, stdout, stdin) {
            if (err) {
                throw err;
            }
        });
        child.stdout.on('end', function() {
            console.log('New tab is opened');
        });
    });

program.command('buildconfig')
    .description('build config')
    .option('-s --search <string>', 'Search a file')
    .option('-r --remove', 'To remove')
    .option('-m --module', 'Do action on module build config file')
    .action(function(options) {
        var path = {
            component: '/Volumes/intelliAd/Frontend/trunk/buildconfig/build.jsb2',
            module: '/Volumes/intelliAd/Frontend/trunk/buildconfig/build_modules.jsb2'
        };
        var buildConfig = require(baseUrl + '/src/buildconfig')(path[(options.module ? 'module': 'component')]);
        if (options.search) {
            buildConfig.findFile(options.search, {toRemove: options.remove});
        }
    });

program.parse(process.argv);
