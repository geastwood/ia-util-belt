var path    = require('path'),
    fs      = require('fs');

module.exports = function(options) {
    var IA = options.core.IA;
    var util = options.core.util;

    var folders = [
        path.dirname(IA().path.getRootPath()),
        IA().path.getRootPath(),
        path.dirname(IA({branch: 'trunk'}).path.getBasePath()),
        path.dirname(IA({branch: 'current'}).path.getBasePath()),
        path.dirname(IA({branch: 'release'}).path.getBasePath()),
        IA({app: 'frontend', branch: 'trunk'}).path.getBasePath(),
        IA({app: 'frontend', branch: 'current'}).path.getBasePath(),
        IA({app: 'frontend', branch: 'release'}).path.getBasePath(),
        IA({app: 'service', branch: 'trunk'}).path.getBasePath(),
        IA({app: 'service', branch: 'current'}).path.getBasePath(),
        IA({app: 'service', branch: 'release'}).path.getBasePath(),
        path.join('/data', 'Frontend_Public'),
        path.join('/data', 'Frontend_Public', 'download'),
        path.join('/data', 'Frontend_Public', 'download', 'attachments'),
        path.join('/data', 'Frontend_Public', 'download', 'reports'),
        path.join('/data', 'Frontend_Public', 'mailqueue'),
        path.join('/data', 'Frontend_Public', 'uq'),
        path.join('/data', 'Frontend_Public', 'uq', 'img'),
        path.join('/data', 'Frontend_Public', 'uq', 'report'),
        path.join('/data', 'Frontend_Public', 'uq', 'tmp')
    ];

    return {
        run: function() {
            folders.forEach(function(folder) {
                if (!fs.existsSync(folder)) {
                    fs.mkdirSync(folder);
                    util.print('success', 'created', folder);
                } else {
                    util.print('info', 'skipped', folder);
                }
            });
        }
    };
};