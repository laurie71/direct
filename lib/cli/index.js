require('colors');
var path = require('path');

function writeln(text) { process.stdout.write((text||'')+'\n'); }

// ------------------------------------------------------------------------
var cli = module.exports = new (function cli() {});
// ------------------------------------------------------------------------

cli.writeln = writeln;

var USAGE = 'USAGE: direct <command> [path] [options]'.bold.red;

var BANNER = [
    '   ___  _              __',
    '  / _ (_)_______ ____/ /_     Direct Web Framework',
    ' / // / // __/ -_) __/ __/    http://directjs.org/',
    '/____/_//_/  __/__/__/        Version: @VERSION@'
].join('\n').bold.blue;


Object.defineProperty(cli, 'USAGE', { value: USAGE });

Object.defineProperty(cli, 'version', {
    enumerable: true,
    get: function getVersion() {
        return 'v0.0.0'; // xxx todo
    }
});

Object.defineProperty(cli, 'banner', {
    enumerable: true,
    get: function getBanner() {
        return BANNER.replace('@VERSION@', cli.version);
    }
});

Object.defineProperty(cli, 'commands', {
    enumerable: true,
    get: function getCommands() {
        return require('./commands');
    }
});

// ------------------------------------------------------------------------

cli.main = function main(argv) {
    var exe = argv[1]
      , cmd = argv[2] || 'help'
      , args = argv.slice(3);
      
    exe = path.basename(exe);

    writeln(cli.banner);
    writeln();
    
    if (!cmd || cmd == 'help') {
        require('./commands').help.execute.call(this, args);
        return;
    }
    
    var cmds = {};
    var cs = require('./commands');
    Object.keys(cs).forEach(function(key) {
        var c = cs[key], nm = (c.plugin ? c.plugin + ':' : '') + c.name;
        cmds[nm] = cs[key];
        return 0;
    });
    
    if (! (cmd in cmds)) {
        console.error('%s: unknown command %s\n', exe, cmd);
        console.error('Try `%s help commands` for a list.\n', exe);
        return 1;
    }

    try {
        cmds[cmd].execute.call(this, args);
    } catch (e) {
        console.error('%s: %s\n', exe, e.message);
    }
};

// ------------------------------------------------------------------------
