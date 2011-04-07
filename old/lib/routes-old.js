var path = require('path');
var error = require('./error');
var utils = require('./utils');
var routes = module.exports;

//var methods = ['*','all','get','put','post','delete','head','optons']; // fixme: is that all?
var methods = require('express').router.methods;
methods = methods.concat(['del', 'all', '*']);

routes.Routes = utils.inherit(Object, {
    constructor: function Routes(appPath) {
        this.appPath = appPath;
        this.appRoutes = path.join(appPath, '/conf/routes.js');
        this.routes = [];
    },
    
    load: function(cb) {
        var rts, i, ilen;
        
        if (! path.exists(this.appRoutes)) {
            return cb(new error.ParseError('Routes not found.', this.appRoutes));
        }
        
        try {
            rts = require(path.join(this.appPath, '/conf/routes.js'));
        } catch (e) {
            return cb(error.ParseError.build(e, this.appRoutes));
        }
        
        this.routes = rts;
        for (i = 0, ilen = rts.length; i < ilen; i++) {
            this.routes[i] = new routes.Route(this.routes[i]);
        }
    },
    
    reverse: function(action/*, params*/) {
        
    }
});

routes.Route = utils.inherit(Object, {
    constructor: function Route(config) {
        if (! Array.isArray(config)) {
            throw new error.ParseError('route config should be an array: '
                +JSON.stringify(config));
        }
        
        this.method = config[0];
        this.path = config[1];
        this.actions = config.slice(2);
        
        this.method = this.method && this.method.toLowerCase();
        if (methods.indexOf(this.method) < 0) {
            throw new error.ParseError(
                'invalid method '+this.method+' in route '+JSON.stringify(config),
                this.appRoutes
            );
        }
    }
});
