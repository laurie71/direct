var utils = require('./utils');
var error = module.exports;

error.DirectError = function DirectError(msg, err) {
    if (msg instanceof Error) {
        err = msg;
        msg = err.message;
    }
    
    this.source = err;
    this.message = msg;
    this.name = arguments.callee.name;
    
    Error.call(this, msg);
    Error.captureStackTrace(this.name);
};

error.ParseError = utils.inherit(error.DirectError, {
    constructor: function ParseError(msg, err, file, line, col) {
        if (msg instanceof Error) {
            col = line; line = file; file = err; err = msg;
            msg = err.message;
        } else if (typeof(err) === 'string') {
            file = err; line = file; col = line;
        }
        
        error.DirectError.call(this, msg, err);
        
        this.file = file || '<unknown file>';
        this.line = line || 0;
        this.col  = col  || 0;
    }
});
