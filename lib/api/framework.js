var lib = require('jslib');
var path = require('path');
var plugins = require('./plugins');
var util = require('./util');

// ------------------------------------------------------------------------
var framework = module.exports = new (function framework() {});
// ------------------------------------------------------------------------

var ROOT = path.join(__dirname, '../../framework');

framework.Framework = lib.inherit(plugins.Plugin, {
    constructor: function Framework() {
        plugins.Plugin.call(this, ROOT);
    
        // Object.defineProperty(this, 'app', {
        //     enumerable: true, 
        //     configurable: true, 
        //     get: function() {
        //         throw new util.error.Error('no application loaded');
        //     }
        // });
    }
});
