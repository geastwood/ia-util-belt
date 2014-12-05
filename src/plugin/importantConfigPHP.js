var fs = require('fs');
var pathUtil = require('path');
var prompt = require('prompt');
var api;

api = module.exports = {
    copy: function(file) {
        var that = this;
        fs.readFile(pathUtil.join((__dirname + '/../../templates/config.important.inc.php')), 'utf8', function(err, data) {
            fs.writeFile(file, data, 'utf8', function(err) {
                if (err) {
                    throw err;
                }
            });
        });
    }
};

/* DEBUG */
// api.copy(pathUtil.normalize('/Users/feiliu/Desktop/config.fei.php'));
