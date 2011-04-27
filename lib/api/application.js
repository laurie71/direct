var async = require('async');
var controller = require('./controller');
var lib = require('jslib');
var path = require('path');
var plugins = require('./plugins');
var routes = require('./routes');
var util = require('./util');

// ------------------------------------------------------------------------
var app = module.exports = new (function app() {});
// ------------------------------------------------------------------------

app.Application = lib.inherit(plugins.Plugin, {
    controller: null,
    routes: null,
    
    constructor: function Application(root, direct) {
        plugins.Plugin.call(this, root, direct);
        
        this.routes = new routes.Routes(this);
        this.controller = new controller.Controller(this);
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
        this.routes.load(cb);
    },
});

// ------------------------------------------------------------------------
