var node = require('node-api');
var cmds = require('./commands');

function help() {
    var keys = Object.keys(cmds);
    keys.sort();
    keys.forEach(function(key) {
        console.log('  %s: %s', cmds[key].syntax, cmds[key].summary)
    });
}

var exe = process.argv[1];
var cmd = process.argv[2];
var args = process.argv.slice(3);
exe = node.path.basename(exe);

if (cmd == 'help') {
    help();
    process.exit(0);
}
if (! (cmd in cmds)) {
    console.error('%s: unknown command %s', exe, cmd);
    process.exit(1);
}

try {
    cmds[cmd].action(args);
} catch (e) {
    console.error('%s: %s', exe, e.message);
}
