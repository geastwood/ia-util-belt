var spawn = require('child_process').spawn,
    api;

api = module.exports = function() {
    var list = ['inotify-tools', 'htop', 'atop', 'multitail'];
    return {
        install: function() {
            list.forEach(function(item) {
                var child = spawn('apt-get', ['install', item]);
                child.stdout.setEncoding('utf8');
                child.stdout.on('data', function(data) {
                    console.log(data);
                });
                child.stderr.setEncoding('utf8');
                child.stderr.on('data', function(data) {
                    console.log(data);
                });
            });
        }
    };
};
