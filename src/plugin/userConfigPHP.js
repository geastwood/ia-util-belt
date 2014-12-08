var fs          = require('fs'),
    path        = require('path'),
    prompt      = require('prompt'),
    emailReg    = /(\w+)@intelliad.com/g,
    api;

api = module.exports = {
    copy: function(file) {
        var that = this;
        fs.readFile(path.join((__dirname + '/../../templates/config.user.php')), 'utf8', function(err, data) {
            fs.writeFile(file, data, 'utf8', function(err) {
                if (err) {
                    throw err;
                }
                that.enterEmail(file);
            });
        });
    },
    enterEmail: function(file) {
        prompt.get([{
            name: 'username',
            description: 'please give username...',
            required: true
        }], function(err, inputs) {
            fs.readFile(file, 'utf8', function(err, data) {
                var rst = data.replace(emailReg, function() {
                    return inputs.username + '@intelliad.com';
                });
                fs.writeFile(file, rst, 'utf8');
            });
        });
    }
};

/* DEBUG */
// api.copy(path.normalize('/Users/feiliu/Desktop/config.user.php'));
