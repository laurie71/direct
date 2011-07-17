var fs = require('fs');
var lib = require('jslib');
var path = require('path');
var resources = require('./resources');
var util = require('./util');
var vm = require('vm');

// ------------------------------------------------------------------------
var routes = module.exports = new (function routes() {});
// ------------------------------------------------------------------------

routes.RoutesError = function(info, callee_, super_) {
    return util.error.build('RoutesError', info, 
        callee_ || arguments.callee,
        super_  || routes.RoutesError // fixme: todo: ResourceFileError
    );
};
routes.RoutesError.prototype = resources.ResourceFileError.prototype; 
// fixme: make this not needed somehow

// ------------------------------------------------------------------------

routes.Route = lib.inherit(Object, {
    constructor: function Route(plugin, method, path, action) {
        // todo: error checking / validation
        
        Object.defineProperty(this, 'plugin', { value: plugin });
        
        this.method = method.toLowerCase();
        this.path = path;
        this.action = action;

this.action = new (require('./controllers').ActionReference)(action);
        
        if (this.method == '*') {
            this.method = 'all';
        }
        
        this.handler = null;
    },

    resolve: function() {
        // var plugin = this.plugin,
        //     a = this.action,
        //     c = plugin.controller,
        //     ac = c.resolve(a.controller),
        //     fn = ca[a];
        //     
        // return fn.call(ac);
        return this.plugin.controller.resolve(this.action);
    },

    handle: function(req, res, next) {
        // if (! this.handler) {
        //     this.handler = this.resolve();
        // }
        // this.handler(req, res, next);
        
        // this.resolve().invoke(req, res, next);
        var fn = this.resolve();
        fn.invoke(this.action.action, req, res, next);
    },

    toString: function() {
        return '[Route: '+this.method+' '+this.path+']';
    }
});


routes.Routes = lib.inherit(resources.ResourceFile, {
    constructor: function Routes(plugin) {
        var id = plugin.id + ':routes',
            file = path.join(plugin.root, 'conf/routes');
        resources.ResourceFile.call(this, id, file);
        this.plugin = plugin;
    },
    
    _loadFile: function(cb) {
        try { 
            var data = require(this.filename); 
        } catch (e) {
            throw new routes.RoutesError({
                message: 'Unable to load routes file: '+e.message,
                filename: this.filename,
                cause: e
            });
        }
        cb && cb(null, data);
    },
    
    _parse: function(data, cb) {
        // todo: error checking / validation
        // -- data is array-of-array of 3-tuple of string,string|regex,string
        this.routes = data.map(function(r) {
            return new routes.Route(this.plugin, r[0], r[1], r[2]);
        }, this);
        cb && cb(null);
    }
});