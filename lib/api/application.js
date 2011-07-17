var async = require('async')
  , lib = require('jslib')
  , path = require('path')
  , controllers = require('./controllers')
  , plugins = require('./plugins')
  , routes = require('./routes')
  , util = require('./util');

// ------------------------------------------------------------------------
var app = module.exports = new (function app() {});
// ------------------------------------------------------------------------

var CBASE = 'app/controllers';

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
    
    bindRoutes: function(svr) {
        this.routes.forEach(function(route) {
            svr[route.method](route.path, route.handle.bind(route));
        }, this);
    },
    
    resolve: function(action) {
        var root = this.app.root
          , file = path.join(root, CBASE, action.controller)
          , a = action.action
          , c;
            
        try { c = require(file); }
        catch (e) { throw e; } // xxx
        
        if (typeof(c[a]) !== 'function') {
            // fixme: throw annotated DirectError
            throw new TypeError(c+'.'+a+' is not a function ('+file+')');
        }
        
        c = lib.inherit(controllers.ActionController, c);
        
        return function(req, res, next) {
            var ctx = new controllers.ActionContext(req,res,next);
            var cc = new c(ctx);
            cc[a]();
        }
    },
    
    toString: function() {
        return '[object AppController]';
    }
});

// ------------------------------------------------------------------------
