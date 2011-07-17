var fs = require('fs');
var lib = require('jslib');
var path = require('path');
var resources = require('./resources');
var util = require('./util');
var vm = require('vm');

// ------------------------------------------------------------------------
var routes = module.exports = new (function routes() {});
// ------------------------------------------------------------------------

routes.RouteError = function(info, callee_, super_) {
    return util.error.build('RouteError', info, 
        callee_ || arguments.callee,
        super_  || routes.RouteError // fixme: todo: ResourceFileError
    );
};
routes.RouteError.prototype = resources.ResourceFileError.prototype; 
// fixme: make this not needed somehow

// ------------------------------------------------------------------------

routes.Route = lib.inherit(Object, {
    constructor: function Route(controller, method, path, action) {
        // todo: error checking / validation
        
        Object.defineProperty(this, 'controller', { value: controller });
        
        this.method = method.toLowerCase();
        this.path = path;
        this.action = action;
        
        if (this.method == '*') {
            this.method = 'all';
        }
        
        this.handler = null;
    },

    _resolve: function() {
        var ca = this.controller.resolve(this.action),
            c = ca[0],
            a = ca[1];
    
        // return c[a].bind(c);
        this.handler = c[a].bind(c);
    },

    handle: function(req, res, next) {
        if (! this.handler) this._resolve();
        this.handler(req, res, next);
    },

    toString: function() {
        return '[Route: '+this.method+' '+this.path+']';
    }
});

// ------------------------------------------------------------------------

routes.RouteLoader = lib.inherit(resources.ResourceFile, {
    constructor: function RouteLoader(controller) {
        var app = controller.app,
            id = app.id + ':routes',
            file = path.join(app.root, 'conf/routes');

        resources.ResourceFile.call(this, id, file);
        this.controller = controller;
    },
    
    _loadFile: function(cb) {
        try { 
            var data = require(this.filename); 
        } catch (e) {
            throw new routes.RouteError({
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
            return new routes.Route(this.controller, r[0], r[1], r[2]);
        }, this);
        cb && cb(null);
    }
});

// ------------------------------------------------------------------------
