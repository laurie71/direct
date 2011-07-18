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

        direct.start(dirp)
    }
}


// ------------------------------------------------------------------------
