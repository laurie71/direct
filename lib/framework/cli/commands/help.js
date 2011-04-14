var cli = require('..');
function writeln(text) { process.stdout.write((text||'')+'\n'); }

var USAGE = 'USAGE: direct <command> [path] [options]'


function helpIntro() {
    writeln('  '+USAGE);
    writeln();
    writeln("Path is optional; if omitted, the current working directory is assumed.");
    writeln();
    
    writeln("Options depend on which command is used. For more information on any");
    writeln("command, use `direct help <command>`. To list available commands, use");
    writeln("`direct help commands`.");
    writeln();
}

function helpCommands() {
    writeln('  '+USAGE);
    writeln();
    writeln("Commands:");
    writeln();
    
    function pad(n) { var s = ''; while (n--) s += ' '; return s; }
    function name(cmd) { return (cmd.plugin ? cmd.plugin+':':'') + cmd.name; }
    
    var cmds = [], col1 = 0;
    Object.keys(cli.commands).forEach(function(key) {
        var cmd = cli.commands[key],
            nm = name(cmd);
        col1 = Math.max(col1, nm.length);
        cmds.push(cmd);
    });
    cmds.sort(function (c1, c2) {
        c1 = name(c1); c2 = name(c2);
        return c1 == c2 ? 0 : c1 > c2 ? 1 : -1;
    });
    cmds.forEach(function(cmd) {
        var n = name(cmd)
        writeln('  ' + n + pad(col1 - n.length) + '  ' + cmd.summary);
    });
}


module.exports = {
    name: 'help',
    summary: 'Display help on using the `direct` command.',
    execute: function(args) {
        if (!args || args.length === 0) {
            helpIntro();
            return;
        }
        if (args[0] === 'commands') {
            helpCommands();
            return;
        }
    }
};