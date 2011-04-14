var path = require('path');

var CMD = path.basename(__filename, '.js');

module.exports = {
    name: 'run',
    plugin: 'app',
    docs: 'docs/cli/'+CMD+'.md',
    syntax: CMD+' path',
    summary: 'start application at path "path".',
    
    action: function(args) {
        var dir = args.length ? args[0] : '',
            dirp = (dir && dir[0] === '/') ? dir : path.join(process.cwd(), dir);
        
            require('util').debug('cwd: '+process.cwd());
            require('util').debug('dir: '+dir);
            require('util').debug('dirp: '+dirp);
            
        // path.exists(dirp, function(exists) {
            // if (! exists) throw new Error('no such directory: '+dir+' ['+dirp+']');
if (!path.existsSync(dirp)) throw new Error('no such directory: '+dir+' ['+dirp+']');
            console.log('Starting application in: '+dir);
            process.chdir(dir);
            
            var eapp = require('../../../framework/application');
            new eapp.Application(dirp);
        // });
    }
}
