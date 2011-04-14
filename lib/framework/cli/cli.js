var path = require('path');
// var cmds = require('./commands');
function writeln(text) { process.stdout.write((text||'')+'\n'); }

var cli = module.exports;

cli.USAGE = 'USAGE: direct <command> [path] [options]'

Object.defineProperty(cli, 'version', {
    enumerable: true,
    get: function getVersion() {
        // todo
        return 'v0.0';
    }
});

Object.defineProperty(cli, 'banner', {
    enumerable: true,
    configurable: true,
    get: function() {
        var BANNER;
        
        BANNER = [
            '   ___  _              __',
            '  / _ (_)_______ ____/ /_     Direct Web Framework',
            ' / // / // __/ -_) __/ __/    http://directjs.org/',
            '/____/_//_/  __/__/__/        Version: @VERSION@'
        ];
        BANNER = BANNER.join('\n');
        BANNER = BANNER.replace('@VERSION@', cli.version);
        
        Object.defineProperty(cli, 'banner', { value: BANNER, enumerable: true });

        return BANNER;
    }
});

Object.defineProperty(cli, 'commands', {
    enumerable: true,
    get: function() {
        return require('./commands');
    }
});

cli.main = function main(argv) {
    var exe = argv[1];
    var cmd = argv[2];
    var args = argv.slice(3);
    exe = path.basename(exe);

    writeln(cli.banner);
    writeln();
    
    if (!cmd || cmd == 'help') {
        require('./commands').help.execute(args);
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
        cmds[cmd].action(args);
    } catch (e) {
        console.error('%s: %s\n', exe, e.message);
    }
};
