var jqtpl = require('jqtpl');
var error = require('./errors');
var util  = require('./util');

var template = module.exports;

template.TemplateError = util.inherit(error.ParseError, {
    constructor: function TemplateCompileError(file, line, col, msg, err) {
        error.ParseError.call(this, file, line, col, msg, err);
        // todo: support for line offset range (start-finish)
    }
});

template.TemplateCompileError = util.inherit(template.TemplateError, {
    constructor: function TemplateCompileError(file, line, col, msg, err) {
        template.TemplateError.call(this, file, line, col, msg, err);
        // todo: support for line offset range (start-finish)
    }
});

function compileString(source, opts) { return compile('<string>', source, opts); };
function renderString(source, opts) { return compile('<string>', source, opts).apply(Array.prototype.slice.call(arguments, 1)); };
function compileFile(filepath, opts, cb) {};
function renderFile(filepath, opts, cb) {};

function compile(filename, source, opts) {
    try {
        opts = opts || {};
        opts.filename = filename;
        return jqtpl.compile(source, opts);
    } catch (e) {
        throw new template.TemplateCompileError(
            filename, e.lineno, e.start, e.message, e);
    }
}
