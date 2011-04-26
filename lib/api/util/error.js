var lib = require('jslib');

// ------------------------------------------------------------------------
var error = module.exports = new (function error() {});
// ------------------------------------------------------------------------

error.addStack = function(e, callee_) { 
    Error.captureStackTrace(e, callee_ || arguments.callee); 
    return e;
};
error.rethrow = function(e, extra_, callee_) { 
    error.addStack(e, callee_ || arguments.callee);
    if (extra_) lib.mixin(e, extra_);
    throw e;
};
error.throw = function(name, message, extra_, callee_) {
    var e = new Error();
    
    e.name = name;
    e.message = message;
    if (extra_) lib.mixin(e, extra_);
    error.addStack(e, callee_ || arguments.callee);
    
    throw e;
};
error.build = function(name, info, callee_, super_) {
    info = info || {};
    super_ = super_ || Error;
    callee_ = callee_ || arguments.callee;

    if (typeof(info) == 'string') {
        info = { message: info, cause: null };
    } else if (info instanceof Error) {
        info = { message: info.message, cause: info };
    } 

    info.name = info.name || name;
    info.message = info.message || (
        info.cause ? info.cause.message : 'Unknown'
    );

    var e = lib.mixin(new Error(), info);
    e.__proto__.prototype = super_.prototype;
    error.addStack(e, callee_);

    return e;
}

/** @param {String|Error|Object} info */
error.Error = function(info, callee_, super_) {
    return error.build('DirectError', info, 
        callee_ || arguments.callee,
        super_  || error.Error
    );
};
error.Error.prototype = Error.prototype; 
// fixme: make this not needed somehow

/** @param {String|Error|Object} info */
error.FileError = function(info, callee_, super_) {
    if (typeof(info) == 'string') {
        info = { filename: info };
    }
    return error.build('FileError', info, 
        callee_ || arguments.callee,
        super_  || error.Error
    );
};
error.FileError.prototype = error.Error.prototype; 
// fixme: make this not needed somehow

/** @param {String|Error|Object} info */
error.ParseFileError = function(info, callee_, super_) {
    if (typeof(info) == 'string') {
        info = { 
            filename: info,
            lineno: null,
            column: null,
            offset: null
        };
    }
    return error.build('ParseFileError', info, 
        callee_ || arguments.callee,
        super_  || error.FileError
    );
};
error.ParseFileError.prototype = error.FileError.prototype;
