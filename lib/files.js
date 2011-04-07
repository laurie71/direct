var errors = require('./error');
var utils = require('./utils');
var files = module.exports;

files.loadScriptSync = function(path) {
    try {
        return require(path);
    } catch (e) {
        throw e; // FIXME: wrap in ParseError
    }
}
