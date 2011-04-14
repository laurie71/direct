var fs = require('fs');
var files = fs.readdirSync(__dirname);

files.forEach(function(file) {
    if (file == 'index.js') return;
    var cmd = require('./'+file);
    module.exports[cmd.name] = cmd;
});
