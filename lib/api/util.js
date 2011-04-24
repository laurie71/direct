var fs = require('fs');
var lib = require('jslib');
var path = require('path');
var vm = require('vm');

var util = module.exports;

// ------------------------------------------------------------------------
util.error = {};
// ------------------------------------------------------------------------

util.error.addStack = function(e, callee_) { 
    Error.captureStackTrace(e, callee_ || arguments.callee); 
    return e;
};
util.error.rethrow = function(e, extra_, callee_) { 
    util.error.addStack(e, callee_ || arguments.callee);
    if (extra_) lib.mixin(e, extra_);
    throw e;
};
util.error.throw = function(name, message, extra_, callee_) {
    var e = new Error();
    
    e.name = name;
    e.message = message;
    if (extra_) lib.mixin(e, extra_);
    util.error.addStack(e, callee_ || arguments.callee);
    
    throw e;
};
util.error.build = function(name, info, callee_, super_) {
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
    util.error.addStack(e, callee_);

    return e;
}

/** @param {String|Error|Object} info */
util.error.Error = function(info, callee_, super_) {
    return util.error.build('DirectError', info, 
        callee_ || arguments.callee,
        super_  || util.error.Error
    );
};
util.error.Error.prototype = Error.prototype; 
// fixme: make this not needed somehow

/** @param {String|Error|Object} info */
util.error.FileError = function(info, callee_, super_) {
    if (typeof(info) == 'string') {
        info = { filename: info };
    }
    return util.error.build('FileError', info, 
        callee_ || arguments.callee,
        super_  || util.error.Error
    );
};
util.error.FileError.prototype = util.error.Error.prototype; 
// fixme: make this not needed somehow

/** @param {String|Error|Object} info */
util.error.ParseFileError = function(info, callee_, super_) {
    if (typeof(info) == 'string') {
        info = { 
            filename: info,
            lineno: null,
            column: null,
            offset: null
        };
    }
    return util.error.build('ParseFileError', info, 
        callee_ || arguments.callee,
        super_  || util.error.FileError
    );
};
util.error.ParseFileError.prototype = util.error.FileError.prototype;

// ------------------------------------------------------------------------
// util.file = {}
// ------------------------------------------------------------------------
// 
// util.file.loadAndParse = function(file, parser)
