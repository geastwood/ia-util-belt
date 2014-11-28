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
program.command('buildconfig [cmd]')
    .description('build config')
    .action(function(cmd) {
        var path = '/Volumes/intelliAd/Frontend/trunk/buildconfig/build.jsb2';
        var fs = require('fs');
        fs.readFile(path, 'utf8', function(err, data) {
            if (err) {
                throw err;
            }
            var d = JSON.parse(data);
            console.log(d);
        });
    });

program.parse(process.argv);
