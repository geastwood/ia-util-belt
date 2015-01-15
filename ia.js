#!/usr/bin/env node

var program = require('commander'),
    chalk   = require('chalk'),
    pkg     = require('./package.json'),
    util    = require('./src/util'),
    prompt  = require('./src/prompt'),
    IA      = require('./src/ia');

// provide the version from package.json
program.version('Current version: ' + pkg.version);
var globalHelp = function() {
    console.log(chalk.green.bold('  More details:'));
    console.log(' ');
    console.log('    Visit: ' + chalk.green(pkg.help.url));
    console.log(' ');
};

                /*****************/
                /* CLI INTERFACE */
                /*****************/
program
    .command('runscript')
    .description('run a user specified script')
    .option('-f --file <file>', 'Specify the bash file to run, e.g. debug.sh')
    .option('-s --silence', 'run in silent, no promot')
    .option('-a --args <args>', 'Provide arguments')
    .action(function(options) {
        var opts = {};

        function runscript() {
            var scriptrunner;
            scriptrunner = require('./src/runscript');
            scriptrunner().run(options);
        }

        if (options.silence) {
            runscript();
        } else {
            opts.message = 'Sure to run script "' + chalk.green(IA().util.getScriptFile(options.file)) + '"?';
            prompt.yesno(opts).then(function(toContinue) {
                if (toContinue === false) {
                    util.print('info', 'CANCELLED BY USER', 'No damage is done.');
                    return;
                }
                runscript();
            });
        }
    })
    .on('--help', function() {

        console.log(chalk.green.bold('  Often-used:'));
        console.log(' ');
        console.log('   \u2022 ia runscript -s -f clean_repo.sh -a "current" \u0009' +
                        'remove `frontend` and `services` from /data/intelliad/current/');
        console.log('   \u2022 ia runscript -s -f clean_repo.sh -a "release" \u0009' +
                        'remove `frontend` and `services` from /data/intelliad/current/');
        console.log('   \u2022 ia runscript -f fr_post_checkout.js           \u0009' +
                        'add two user config `config.user.php` and `config.important.inc.php`');
        console.log('   \u2022 ia runscript -f service_post_checkout.js      \u0009' +
                        'create `log/application.log` chmod `log` folder recursively');
        console.log(' ');
        globalHelp();
    });
program
    .command('config')
    .description('config this cli')
    .action(function () {
        require('./src/user_config')();
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
    .option('-v --serviceclient',   'serviceclient')
    .option('-m --module',          'module')
    .action(function(options) {
        require('./src/build').build(options);
    })
    .on('--help', function() {
        console.log(chalk.green.bold('  Details'));
        console.log('\n');
        console.log(chalk.green('    `-f` and `-s` stand for `frontend` and `service`'));
        console.log(chalk.green('    `-t`, `-c` and `-r` stand for `trunk`, `current` and `release`'));
        console.log(chalk.green('\n    Please free composite these options!'));
        console.log('    -------------------------------------');
        console.log('    %s    %s', '-ftd', 'frontend  trunk  development');
        console.log('    %s    %s', '-ftp', 'frontend  trunk  part');
        console.log('    %s    %s', '-ftl', 'frontend  trunk  legacy');
        console.log('    %s    %s', '-ftv', 'frontend  trunk  service-client');
        console.log('    %s    %s', '-ftm', 'frontend  trunk  modules');
        console.log('    -------------------------------------');
        console.log('    %s    %s', '-fcd', 'frontend current development');
        console.log('    %s    %s', '-fcp', 'frontend current part');
        console.log('    %s    %s', '-fcl', 'frontend current legacy');
        console.log('    %s    %s', '-fcv', 'frontend current service-client');
        console.log('    %s    %s', '-fcm', 'frontend current modules');
        console.log('    -------------------------------------');
        console.log('    %s    %s', '-frd', 'frontend release development');
        console.log('    %s    %s', '-frp', 'frontend release part');
        console.log('    %s    %s', '-frl', 'frontend release legacy');
        console.log('    %s    %s', '-frv', 'frontend release service-client');
        console.log('    %s    %s', '-frm', 'frontend release modules');
        console.log('    -------------------------------------');
        console.log('    %s    %s', '-st',  'service  release');
        console.log('    %s    %s', '-sc',  'service  release');
        console.log('    %s    %s', '-sr',  'service  release');
        console.log('    -------------------------------------');
        globalHelp();
    });

program.command('watch')
    .description('small watch function')
    .option('-t --trunk',           'use trunk')
    .option('-r --release',         'use release')
    .option('-c --current',         'use current')
    .action(function(options) {
        var util = require('./src/util'),
            watcher = require('./src/watch');

        watcher().watch(util.parseGlobal(options));
    })
    .on('--help', function() {
        globalHelp();
    });

program
    .command('devmode <cmd>')
    .description('[on|off|is|toggle] switch dev mode')
    .option('-t --trunk',   'use trunk')
    .option('-r --release', 'use release')
    .option('-c --current', 'use current')
    .action(function(cmd, options) {
        var devmode = require('./src/devmode'), iniFile;

        prompt.getBranch(options).then(function(opts) {
            iniFile = IA(opts).path.getAppIni();
            return devmode(iniFile)[(cmd === 'is') ? 'load' : 'update'](cmd);
        }).then(function(status) {
            util.print('info', 'status', '%s "%s" at %s', 'Development mode is',
                chalk[(status.isOn ? 'green' : 'red')](status.isOn ? 'ON' : 'OFF'),
                iniFile);
        });
    })
    .on('--help', function() {
        console.log(chalk.green.bold('  Available commands:'));
        console.log(' ');
        console.log(chalk.green('    ls') + '\u0009\u0009 SHOW current configuration');
        console.log(chalk.green('    on') + '\u0009\u0009 turn ON development mode');
        console.log(chalk.green('    off') + '\u0009\u0009 turn OFF development mode');
        console.log(' ');
        console.log(chalk.green.bold('  Example:\n'));
        console.log(chalk.green('    ia devmode -t is') + '\u0009\u0009 check current `dev mode` of frontend `trunk`');
        console.log(chalk.green('    ia devmode --release on') + '\u0009 turn on `dev mode` of frontend `current`');
        console.log(chalk.green('    ia devmode -c off') + '\u0009\u0009 turn off `dev mode` of frontend `current`');
        console.log(' ');
        globalHelp();
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
        var util = require('./src/util'),
            globals = util.parseGlobal(options),
            paths = {
                component: IA(globals).path.getComponentBuildConfig(),
                module: IA(globals).path.getModuleBuildConfig()
            },
            buildConfig = require('./src/buildconfig'),
            command = typeof options['delete'] === 'undefined' ? 'print' : 'remove';

        buildConfig(paths[(options.module ? 'module': 'component')])[command](options.grep);
    })
    .on('--help', function() {
        globalHelp();
    });

var apacheOptions = ['start', 'stop', 'graceful-stop', 'restart', 'reload',
    'force-reload', 'start-htcacheclean', 'stop-htcacheclean', 'status'];
program.command('apache <cmd>')
    .description('apache commands')
    .action(function(cmd) {
        var exec = require('child_process').exec, child;
        if (apacheOptions.indexOf(cmd) < 0) {
            util.print('error', 'wrong command', 'Invalid option, only ' + apacheOptions.join('|'));
        }
        child = exec('service apache2 ' + cmd);
        child.stdout.on('data', function(data) {
            console.log(data);
        });
    })
    .on('--help', function() {
        console.log(chalk.green.bold('  Available commands:'));
        console.log(' ');
        console.log(apacheOptions.map(function(option) {
            return '    * ' + option;
        }).join('\n'));
        console.log(' ');
        globalHelp();
    });

program.command('module <cmd>')
    .description('contains frontend module related functions, e.g, create empty module')
    .action(function(cmd) {
        var valids = ['create'], module;
        if (valids.indexOf(cmd) < 0) {
            util.print('error', 'wrong input', 'Valid options are "%s".', valids.join('|'));
            return;
        }
        module = require('./src/module');
        module()[cmd]();
    });

program.command('ticket')
    .description('ticket template related functions')
    .action(function() {
        var inquirer = require('inquirer'),
            ticket = require('./src/ticket');
        inquirer.prompt([{
            name: 'cmd',
            type: 'list',
            message: 'Please select command',
            choices: [
                {name: 'Create (Local)', value: 'create'},
                {name: 'Edit (Remote)', value: 'edit'},
                {name: 'Edit (Local clipboard)', value: 'clipboard'},
                {name: 'Read (Local)', value: 'read'},
                {name: 'Delete (Local)', value: 'delete'}
            ],
            'default': 'create'
        }],
        function(answers) {
            ticket[answers.cmd]();
        });
    });

program.on('--help', function() {
    globalHelp();
});

program.parse(process.argv);
