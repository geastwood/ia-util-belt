var spawn   = require('child_process').spawn,
    IA      = require(__dirname + '/./ia'),
    chalk   = require('chalk'),
    api;

api = module.exports = function() {
    return {
        // watch the `application/javascripts/application` folder for changes
        // and restart the build
        watch: function(opts) {
            var watchPath = IA(opts).path.getAppJsFolder(),
                child = spawn('fswatch', [watchPath]),
                ant;

            console.log(chalk.blue('INFO\u0009(STARTED)\u0009') + '%s "%s"', 'Start to monitor on', watchPath);

            child.stdout.setEncoding('utf8');
            child.stdout.on('data', function() {

                // if there already a `build` process, then kill and rebuilt
                if (ant) {
                    ant.kill('SIGABRT');
                }

                ant = spawn('ant', ['-f', IA(opts).path.getBuildXml()]);
                ant.stdout.setEncoding('utf8');
                ant.stdout.on('data', function(data) {
                    console.log(data);
                });

                ant.on('exit', function(err, sig) {
                    if (sig === 'SIGABRT') {
                        console.log(chalk.blue('INFO\u0009(RESTART)\u0009') + '%s',
                                    'there is another change detected, build restarted.');
                    } else {
                        console.log(chalk.blue('INFO\u0009(FINISHED)\u0009') + '%s',
                                    'Process finished');
                    }
                });
            });
        }
    };
};
