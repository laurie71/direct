var fs = require('fs')
  , fspath = require('path');

// ------------------------------------------------------------------------
var commands = module.exports = new (function commands() {});
// ------------------------------------------------------------------------

fs.readdirSync(__dirname).forEach(function(file) {
    if (file == 'index.js') return
    var cmd = require(fspath.join(__dirname, file))
      , nm = cmd.name || fspath.basename(file, '.js')
    commands[nm] = cmd
    cmd.name = nm
})

// ------------------------------------------------------------------------

Object.keys(commands).forEach(function(n) { commands[n].name = n })

// ------------------------------------------------------------------------
