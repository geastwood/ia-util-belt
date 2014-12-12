var spawn   = require('child_process').spawn,
    IA      = require(__dirname + '/ia'),
    util    = require(__dirname + '/util'),
    api;

api = module.exports = function() {
    return {
        // watch the `application/javascripts/application` folder for changes
        // and restart the build
        watch: function(opts) {
            var watchPath = IA(opts).path.getAppJsFolder(),
                // child = spawn('fswatch', [watchPath]), // this is for mac version
                child = spawn('inotifywait', ['-rmc', '--event', 'MODIFY', watchPath]),
                ant;

            util.print('info', 'started', '%s "%s"', 'Start to monitor on', watchPath);

            child.stdout.setEncoding('utf8');
            child.stdout.on('data', function() {

                // if there already a `build` process, then kill and rebuilt
                if (ant) {
                    ant.kill('SIGABRT');
                }

                ant = spawn('ant', ['-f', IA(opts).path.getBuildXml()]);
                ant.stdout.setEncoding('utf8');
                ant.stdout.on('data', function(data) {
                    util.stdout(data);
                });

                ant.on('exit', function(err, sig) {
                    if (sig === 'SIGABRT') {
                        util.print('info', 'restarted', 'There is another change detected, build restarted.');
                    } else {
                        util.print('success', 'finished', 'Process finished');
                    }
                });
            });
        }
    };
};
