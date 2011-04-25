var async = require('async');
var lib = require('jslib');
var path = require('path');
var plugins = require('./plugins');
var util = require('./util');

// ------------------------------------------------------------------------
var app = module.exports = new (function app() {});
// ------------------------------------------------------------------------

app.Application = lib.inherit(plugins.Plugin, {
    constructor: function Application(root, direct) {
        plugins.Plugin.call(this, root, direct);
    },
    
    _load: function(cb) {
        async.series(
            [ this.super_._load.bind(this)
            , this._loadPlugins.bind(this)
            , this._loadRoutes.bind(this)
            ],
            cb
        );
    },

    _loadPlugins: function(cb) {
console.info('...load app plugins...');
        cb && cb(null); 
    },

    _loadRoutes: function(cb) {
console.info('...load app routes...');
        cb && cb(null); 
    },
});

// ------------------------------------------------------------------------
