var api;
var chalk   = require('chalk');
var spawn   = require('child_process').spawn;
var util    = require('./util');
var prompt  = require('./prompt');
var IA      = require('./ia');

var map = {
    full: null, // run a full build, no param pass to `ant`
    development: 'build-development',
    part: 'dev-part-js-ng',
    legacy: 'dev-part-js-legacy',
    serviceclient: 'build-serviceclient',
    module: 'dev-part-js-ng-modules'
};

api = module.exports = {
    build: function(opts) {
        var child, args;
        prompt.getBuildOptions(opts).then(function(opts) {
            var rst = opts.rst;
            if (map[rst.target]) {
                args = [map[rst.target], '-f', IA(rst).path.getBuildXml()];
            } else {
                args = ['-f', IA(rst).path.getBuildXml()];
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
        });
    }
};
