var errors = require('../errors');
var utils = require('../util');
var files = module.exports;

files.loadScriptSync = function(path) {
    try {
        return require(path);
    } catch (e) {
        throw e; // FIXME: wrap in ParseError
    }
}
