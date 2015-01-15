var fs      = require('fs');
var Q       = require('q');

module.exports = function(path) {

    var modeRegex = /(?:\[development\s*:\s*developmentBase[\s\S]*)^app\.developerMode(?:\s*)=(?:\s)(\d)/gm,
        debugRegex = /(?:\[development\s*:\s*developmentBase[\s\S]*)^app\.debug(?:\s*)=(?:\s)(\d)$/gm;

    return {
        readFile: Q.nfbind(fs.readFile)(path, 'utf8'),
        load: function() {
            return this.readFile.then(function (data) {
                var mode = modeRegex.exec(data),
                    defer = Q.defer(),
                    debug = debugRegex.exec(data), modeFlag, debugFlag;

                if (mode === null || debug === null) {
                    defer.reject('error when parsing.');
                }
                modeFlag = parseInt(mode[1], 10);
                debugFlag = parseInt(mode[1], 10);

                defer.resolve({
                    isOn: modeFlag && debugFlag,
                    mode: modeFlag,
                    debug: debugFlag,
                    content: data
                });

                return defer.promise;
            });
        },
        update: function(action) {
            // on, off
            return this.load().then(function(data) {
                var mode, debug, defer = Q.defer();
                if (action === 'toggle') {
                    action = data.mode && data.debug ? 'off' : 'on';
                }
                if (action === 'on') {
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
                    if (err) {
                        defer.reject(err);
                    }
                    defer.resolve({isOn: mode && debug});
                });
                return defer.promise;
            });
        }
    };
};
