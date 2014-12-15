var api,
    chalk   = require('chalk'),
    spawn   = require('child_process').spawn,
    util    = require(__dirname + '/util'),
    IA      = require(__dirname + '/ia');

var map = {
    development: 'build-development',
    part: 'dev-part-js-ng',
    legacy: 'dev-part-js-legacy',
    serviceclient: 'build-serviceclient',
    module: 'dev-part-js-ng-modules'
};

api = module.exports = {
    build: function(opts) {
        var child, args;

        if (opts.flag) {
            args = [map[opts.flag], '-f', IA(opts).path.getBuildXml()];
        } else {
            args = ['-f', IA(opts).path.getBuildXml()];
        }

        child = spawn('ant', args);
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', function(data) {
            util.stdout(data);
        });
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', function(data) {
            util.stdout(chalk.red('ERROR: ' + data));
        });
        child.on('exit', function() {});
    }
};
