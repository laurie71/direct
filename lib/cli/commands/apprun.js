var fspath = require('path')
  , direct = require('../../../index')
  , Application = direct.api.application.Application;

// ------------------------------------------------------------------------

module.exports = {
    name: 'app:run',
    summary: 'Run an application in the current console.',
    execute: function(args) {
        var dir = args.length ? args[0] : '',
            dirp = (dir && dir[0] == '/') ? dir : fspath.join(process.cwd(), dir);

if (! fspath.existsSync(dirp)) throw new Error('no such directory: '+dir+' ['+dirp+']');

        process.chdir(dirp);

    // xxx cli.main needs to load the framework; until it does, we'll do it here
    direct.framework.load(function(err) {
        if (err) throw err;

        var app = new Application(dirp, direct.framework);
        app.load(function(err) {
            if (err) throw err;
        
            var server = require('../../api/server');
            var svr = new server.Server(app);
            svr.on('listening', function() { 
                console.log('Server listening at http://%s:%s/', 
                    svr.address().address,
                    svr.address().port
                )
            });
        
            svr.listen(1234);
        });
    });

    }
}


// ------------------------------------------------------------------------
