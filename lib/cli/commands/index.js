var path = require('path');

// ------------------------------------------------------------------------
var commands = module.exports = new (function commands() {});
// ------------------------------------------------------------------------

commands['help'] = require('./help');
commands['app:new'] = require('./appnew');

// ------------------------------------------------------------------------

Object.keys(commands).forEach(function(n) { commands[n].name = n })

// ------------------------------------------------------------------------
