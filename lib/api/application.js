var async = require('async')
  , controller = require('./controllers')
  , lib = require('jslib')
  , path = require('path')
  , plugins = require('./plugins')
  , routes = require('./routes')
  , util = require('./util');

// ------------------------------------------------------------------------
var app = module.exports = new (function app() {});
// ------------------------------------------------------------------------

app.Application = lib.inherit(plugins.Plugin, {
    controller: null,
    
    constructor: function Application(root, framework) {
        plugins.Plugin.call(this, root, framework);
        this.controller = new app.AppController(this);
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
        this.controller.loadRoutes(cb);
    },
});

// ------------------------------------------------------------------------

app.AppController = lib.inherit(Object, {
    app: null,
    routes: null,
    
    constructor: function(app) {
        this.app = app;
        this.routes = [];
    },
    
    loadRoutes: function(cb) {
        var that = this;
        var loader = new routes.RouteLoader(this);
        loader.load(function(err, routes) {
            if (err) return cb(err);
            that.routes = loader.routes;
            cb(null);
        })
    },
    
    resolve: function(action) {
        var root = this.app.root,
            parts = action.split('.'),
            c = parts[0],
            a = parts[1],
            file;
            
        file = path.join(root, 'app/controllers', c);
        try { c = require(file); }
        catch (e) { throw e; } // xxx
        
        if (typeof(c[a]) !== 'function') {
            // fixme: throw annotated DirectError
            throw new TypeError(c+'.'+a+' is not a function ('+file+')');
        }
        
        return [c, a];
    },
    
    toString: function() {
        return '[object AppController]';
    }
});

// ------------------------------------------------------------------------
