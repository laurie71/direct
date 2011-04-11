var utils = require('./util');

/** @namespace direct.error */
var error = module.exports;

var errorId = function() {
    return Date.now().toString(36);
};

function captureStack(e, root) {
    if (! e._captured) {
        Error.captureStackTrace(e, root);
        e._captured = true;
    }
}

function makeError(e, root, props) {
    props = props || {};
    
    Object.defineProperty(e, 'id', {
        enumerable: true,
        value: errorId()
    });
    
    utils.mixin(e, props);

    e.name = e.name || e.__proto__.constructor.name || 'DirectError';
    e.message = e.message || e.cause && e.cause.message || '';
    captureStack(e, root);
    
    e.hasSource = function() { return this.source !== undefined; }
        
    return e;
}

// ------------------------------------------------------------------------

/**
 * Create an object describing the location in a file at which an error
 * occurred. Used to describe the location of an error found while reading,
 * parsing/compiling, evaluating or otherwise processing a source file.
 *
 * @param {String} filename
 *      The name of the file where the error was found. If `null` or empty,
 *      defaults to `'<unknown source>'`.
 * @param {[Integer]} lineno
 *      The line in `filename` at which the error was found. 
 *      **Note:** The first line should be numbered `1`, not `0`.
 * @param {[Integer]} start
 *      The character in the line at which the error was found. 
 *      **Note:** The first character should be numbered `1`, not `0`.
 * @param {[Integer]} span
 *      The length of the span of characters comprising the error.
 *      If specified, this will be used to highlight `span` characters
 *      from `lineno`:`start` when reporting an error. 
 */
error.SourceInfo = function(filename, lineno, start, span) {
    var info = {};
    info.filename = filename || '<unknown source>';
    info.lineno = lineno
    info.start = start;
    info.span = span;
    return info;
}

/**
 * Create supporting detail for an error's {@link error.SourceInfo}.
 * If `source` is of type `String` it will be split into lines.
 * If `source` is not the full text of the source file, `offset`
 * should indicate which line in `source` corresponds with the
 * error's `source.lineno` property.
 *
 * For example, if `source` contains three lines of code, with the
 * line identifed by `error.source.lineno` in the middle, then
 * `offset` should be equal to `1`.
 *
 * @param {Array|String} source
 * @param {[Integer]} offset
 */
error.SourceDetail = function(source, offset) {
    if (typeof(source) === 'string') source = source.split('\n');
    return { source: source, offset: offset || 0 };
}

/**
 * The base type for all errors thrown in Direct.
 *
 * @param {String} message
 * @param {[Object]} props
 * @param {[String]} props.name
 * @param {[Error|String]} props.cause
 * @param {[direct.error.SourceInfo]} props.source
 */
error.DirectError = function DirectError(msg, props) {
    props = props || {};
    props.message = msg;
    props.name = props.name || 'DirectError';
    return makeError(new Error(), arguments.callee, props);
};

// error.DirectError = utils.inherit(Error, {
//     name: null,
//     title: null,
//     details: '',
//     
//     sourceFile: null,
//     sourceLine: null,
//     sourceColumn: null,
//     sourceOffset: 0,
//     sourceDetail: null,
//     
//     constructor: function DirectError(msg, props) {
//     
//         
//         Error.call(this, msg);
//         this._captureStack(arguments.callee);
//     },
// 
// 
//     hasSource: function() {
//         return !!(this.sourceFile !== undefined ||
//                   this.sourceDetail != undefined);
//     },
//     
//     getSource: function() {
//         if (sourceDetail) return sourceDetail;
//     }
// });

// ------------------------------------------------------------------------

// error.SourceError = utils.inherit(error.DirectError, { // XXX refactor: remove in favour of ParseError
//     constructor: function SourceError(file, line, col, msg, err) {
//         this._captureStack(arguments.callee);
//         
//         if (msg instanceof Error) {
//             err = msg;
//             msg = err.message;
//         } 
//         
//         error.DirectError.call(this, msg, err);        
//         this.sourceFile = file || '<unknown file>';
//         this.sourceLine = line;
//         this.sourceColumn = col;
//     }
// });

// ------------------------------------------------------------------------

// error.FileError = utils.inherit(error.DirectError, {
//     constructor: function FileError(file, msg, err) {
//         this._captureStack(arguments.callee);
//         error.DirectError.call(this, msg, err);
//         this.sourceFile = file;
//     }
// });
// 
// error.MissingFileError = utils.inherit(error.FileError, {
//     constructor: function MissingFileError(file, msg, err) {
//         this._captureStack(arguments.callee);
// 
//         if (! (msg || err)) {
//             msg = file;
//         }
// 
//         error.FileError.call(this, file, msg, err);
//         this.sourceFile = file;
//     }
// });
// 
// error.ParseError = utils.inherit(error.FileError, {
//     constructor: function ParseError(file, line, col, msg, err) {
//         this._captureStack(arguments.callee);
//         
//         // col is optional
//         if (typeof(col) !== 'number') {
//             err = msg;
//             msg = col;
//             col = undefined;
//         }
//         
//         // msg is optional
//         if (msg instanceof Error) {
//             err = msg;
//             msg = err.message;
//         }
//         
//         // message defaults to file:line:col
//         if (! (msg || err)) {
//             msg = file + ':'+line;
//             if (col !== undefined) {
//                 msg += ':'+col;
//             }
//         }
//         
//         error.FileError.call(this, file, msg, err);
//         this.sourceFile = file;
//         this.sourceLine = line;
//         this.sourceColumn = col;
//     }
// });
