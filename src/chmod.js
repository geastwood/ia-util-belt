var fs = require('fs');
var emailReg = /(xxxx)@intelliad.com/g;
fs.readFile(__dirname + '/../templates/config.user.php', 'utf8', function(err, data) {
    var rst = data.replace(emailReg, function(a, match) {
        return 'fliu' + '@intelliad.com';
    });
    console.log(rst);
});
