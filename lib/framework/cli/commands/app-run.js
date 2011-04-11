var node = require('node-api');

var CMD = node.path.basename(__filename, '.js');

module.exports = {
    name: CMD,
    docs: 'docs/cli/'+CMD+'.md',
    syntax: CMD+' path',
    summary: 'start application at path "path".',
    
    action: function(args) {
        var dir = args.length ? args[0] : process.cwd();
        
        if (! node.path.exists(dir)) throw new Error('no such directory: '+dir);
        console.log('Starting application in: '+dir);
        process.chdir(dir);

    }
}
