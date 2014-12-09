var fs = require('fs'),
    chalk = require('chalk');

module.exports =function(path) {

    var modeRegex = /(?:\[development\s*:\s*developmentBase[\s\S]*)^app\.developerMode(?:\s*)=(?:\s)(\d)/gm,
    debugRegex = /(?:\[development\s*:\s*developmentBase[\s\S]*)^app\.debug(?:\s*)=(?:\s)(\d)$/gm;

    return {
        read: function(fn) {
            fs.readFile(path, 'utf8', function(err, data) {
                if (err) {
                    fn(err);
                }
                var mode = modeRegex.exec(data),
                debug = debugRegex.exec(data), modeFlag, debugFlag;
                if (mode === null || debug === null) {
                    fn('error when parsing.');
                }
                modeFlag = parseInt(mode[1], 10);
                debugFlag = parseInt(mode[1], 10);

                fn(null, {
                    isOn: modeFlag && debugFlag,
                    mode: modeFlag,
                    debug: debugFlag,
                    content: data
                });
            });
        },
        update: function(state, fn) {
            // on, off
            this.read(function(err, data) {
                var mode, debug;
                if (err) {
                    fn(err);
                }
                if (state === 'on') {
                    mode = 1;
                    debug = 1;
                } else {
                    mode = 0;
                    debug = 0;
                }
                data.content = data.content.replace(modeRegex, function(full) {
                    return full.slice(0, full.length - 1) + mode;
                });
                data.content = data.content.replace(debugRegex, function(full) {
                    return full.slice(0, full.length - 1) + debug;
                });
                fs.writeFile(path, data.content, function(err) {
                    fn(err, {isOn: mode && debug});
                });
            });
        },
        log: function(status, path) {
            console.log('\n');
            console.log(chalk.blue('INFO\u0009(STATUS)\u0009') +
                        '%s "%s" at %s',
                        'Development mode is ',
                        chalk[(status ? 'green' : 'red')].underline(status ? 'ON' : 'OFF'),
                        path
                       );
            console.log('\n');
        }
    };
};
