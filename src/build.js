var api,
    chalk   = require('chalk'),
    spawn   = require('child_process').spawn,
    IA      = require(__dirname + '/./ia');

var map = {
    development: 'build-development',
    part: 'dev-part-js-ng',
    legacy: 'dev-part-js-legacy',
    serviceclient: 'build-serviceclient',
    module: 'dev-part-js-ng-modules'
};

api = module.exports = {
    build: function(opts) {
        var child;
        child = spawn('ant', [
            map[opts.flag] || '',
            '-f',
            IA(opts).path.getBuildXml()
        ]);
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', function(data) {
            console.log(data);
        });
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', function(data) {
            console.log(chalk.red('ERROR: ' + data));
        });
        child.on('exit', function(err, sig) {});
    }
};
