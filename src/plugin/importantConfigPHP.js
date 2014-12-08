var fs = require('fs'),
    path = require('path'),
    api;

api = module.exports = {
    copy: function(file) {
        fs.readFile(path.join((__dirname + '/../../templates/config.important.inc.php')), 'utf8', function(err, data) {
            fs.writeFile(file, data, 'utf8', function(err) {
                if (err) {
                    throw err;
                }
            });
        });
    }
};

/* DEBUG */
// api.copy(path.normalize('/Users/feiliu/Desktop/config.fei.php'));
