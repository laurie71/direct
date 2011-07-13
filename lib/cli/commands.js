var path = require('path');

// ------------------------------------------------------------------------
var commands = module.exports = new (function commands() {});
// ------------------------------------------------------------------------

commands['help'] = {
    summary: 'Display help on using the `direct` command.',
    
    execute: function(args) {
        if (!args || args.length === 0) {
            helpIntro.call(this);
            return;
        }
        if (args[0] === 'commands') {
            helpCommands.call(this);
            return;
        }
    }    
};

function helpIntro() {
    var writeln = this.writeln;
    
    writeln('  ' + this.USAGE);
    writeln();
    writeln("Path is optional; if omitted, the current working directory is assumed.");
    writeln();
    
    writeln("Options depend on which command is used. For more information on any");
    writeln("command, use `direct help <command>`. To list available commands, use");
    writeln("`direct help commands`.");
    writeln();
}

function helpCommands() {
    var writeln = this.writeln;
    
    writeln('  ' + this.USAGE);
    writeln();
    writeln("Commands:");
    writeln();
    
    function pad(n) { var s = ''; while (n--) s += ' '; return s; }
    function name(cmd) { return (cmd.plugin ? cmd.plugin+':':'') + cmd.name; }
    
    var cmds = [], col1 = 0;
    Object.keys(this.commands).forEach(function(key) {
        var cmd = this.commands[key],
            nm = name(cmd);
        col1 = Math.max(col1, nm.length);
        cmds.push(cmd);
    }, this);
    cmds.sort(function (c1, c2) {
        c1 = name(c1); c2 = name(c2);
        return c1 == c2 ? 0 : c1 > c2 ? 1 : -1;
    });
    cmds.forEach(function(cmd) {
        var n = name(cmd)
        writeln('  ' + n + pad(col1 - n.length) + '  ' + cmd.summary);
    });
    writeln();
}

// ------------------------------------------------------------------------

Object.keys(commands).forEach(function(n) { commands[n].name = n })

// ------------------------------------------------------------------------
