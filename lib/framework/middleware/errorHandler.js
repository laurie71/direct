var utils = require('../../util');

// ------------------------------------------------------------------------

module.exports = function errorHandler(options) {
    var defaults = { 
        dumpExceptions: true
    };
    
    options = utils.mixin({}, defaults, options);
    
    return function(err, req, res, next) {
        var id, msg = '';
        err = err || 'Unknown Error';
        
        // if (err instanceof error.DirectError) {
        //     id = err.id;
        //     msg = 'Error ID: '+id+'\n';
        // }
        if (err.id) msg = '[ID: '+err.id+'] ';
        msg += (err.stack || JSON.stringify(error, null, 2));
        
        req.statusCode = 500;
        
        if (options.dumpExceptions) {
            console.error(msg);
        }
        
        res.render(__dirname+'/../../../framework/views/500.html', {
            app: { env: res.app.settings.env },
            error: err
        });
    }
}

// ------------------------------------------------------------------------
