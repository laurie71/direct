var utils = require('./utils');
var error = module.exports;

var errorId = function() {
    return Date.now().toString(36);
};

// ------------------------------------------------------------------------

error.handler = function(options) {
    var defaults = { 
        dumpExceptions: true
    };
    
    options = utils.mixin({}, defaults, options);
    
    return function(err, req, res, next) {
        var id, msg = '';
        err = err || 'Unknown Error';
        
        if (err instanceof error.DirectError) {
            id = err.id;
            msg = 'Error ID: '+id+'\n';
        }
        msg += (err.stack || JSON.stringify(error, null, 2));
        
        req.statusCode = 500;
        
        if (options.dumpExceptions) {
            console.error(msg);
        }
        
        res.render(__dirname+'/../framework/views/500.html', {
            app: { env: res.app.settings.env },
            error: err
        });
    }
}

// ------------------------------------------------------------------------

error.DirectError = utils.inherit(Error, {
    title: null,
    
    sourceFile: null,
    sourceLine: null,
    sourceColumn: null,
    sourceOffset: 0,
    sourceDetail: null,
    
    constructor: function DirectError(msg, err) {
        this._captureStack(arguments.callee);
    
        if (msg instanceof Error) {
            err = msg;
            msg = err.message;
        }
    
        this.cause = err;
        this.message = msg;
        this.details = null;
    
        Error.call(this, msg);
    
        Object.defineProperty(this, 'id', {
            enumerable: true,
            value: errorId()
        });
    },

    _captureStack: function(root) {
        if (! this._captured) {
            Error.captureStackTrace(this, root);
            this._captured = true;
        }
    },

    hasSource: function() {
        return !!(this.sourceFile !== undefined ||
                  this.sourceDetail != undefined);
    },
    
    getSource: function() {
        if (sourceDetail) return sourceDetail;
    }
});

// ------------------------------------------------------------------------

error.SourceError = utils.inherit(error.DirectError, { // XXX refactor: remove in favour of ParseError
    constructor: function SourceError(file, line, col, msg, err) {
        this._captureStack(arguments.callee);
        
        if (msg instanceof Error) {
            err = msg;
            msg = err.message;
        } 
        
        error.DirectError.call(this, msg, err);        
        this.sourceFile = file || '<unknown file>';
        this.sourceLine = line;
        this.sourceColumn = col;
    }
});

// ------------------------------------------------------------------------

error.FileError = utils.inherit(error.DirectError, {
    constructor: function FileError(file, msg, err) {
        this._captureStack(arguments.callee);
        error.DirectError.call(this, msg, err);
        this.sourceFile = file;
    }
});

error.MissingFileError = utils.inherit(error.FileError, {
    constructor: function MissingFileError(file, msg, err) {
        this._captureStack(arguments.callee);

        if (! (msg || err)) {
            msg = file;
        }

        error.FileError.call(this, file, msg, err);
        this.sourceFile = file;
    }
});

error.ParseError = utils.inherit(error.FileError, {
    constructor: function ParseError(file, line, col, msg, err) {
        this._captureStack(arguments.callee);
        
        // col is optional
        if (typeof(col) !== 'number') {
            err = msg;
            msg = col;
            col = undefined;
        }
        
        // msg is optional
        if (msg instanceof Error) {
            err = msg;
            msg = err.message;
        }
        
        // message defaults to file:line:col
        if (! (msg || err)) {
            msg = file + ':'+line;
            if (col !== undefined) {
                msg += ':'+col;
            }
        }
        
        error.FileError.call(this, file, msg, err);
        this.sourceFile = file;
        this.sourceLine = line;
        this.sourceColumn = col;
    }
});
