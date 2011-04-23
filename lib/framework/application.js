var async = require('async');
var path = require('path');

var plugins = require('./plugin');
var utils = require('../util');

// ------------------------------------------------------------------------
var app = module.exports;
// ------------------------------------------------------------------------

app.createApplication = function(dir) {
    if (! path.exists(dir)) {
        throw new Error('Missing application directory: '+dir);
    }
    
    var application = new app.Application(dir);
}

// ------------------------------------------------------------------------

app.Application = utils.inherit(plugins.Plugin, {
    constructor: function Application(root, framework) {
        // enforce singelton semantics
        if (app.Application.instance) {
            throw new Error('Application already loaded.');
        }
        app.Application.instance = this;

        // initialize
        // utils.info('Loading Application at '+root);
        utils.debug('Loading Application at '+root);
        framework = framework || require('../framework'); // xxx
        plugins.Plugin.call(this, root);
        this.plugins = {};
        
        this.env = this.settings.env = process.env.EXPRESSIVE_ENV || process.env.NODE_ENV || 'production';
        process.env.EXPRESSIVE_ENV = process.env.NODE_ENV = this.env;
    },
    
    _load: function(cb) {
        async.series(
            [ this.super_._load.bind(this)
            , this._loadPlugins.bind(this)
            , this._loadRoutes.bind(this)
            ], 
            cb)
    },
    
    _loadPlugins: function(cb) {
        this.plugins = {};
utils.debug('Loading Application Plugins...');
        // ensure core 'framework' plugin isn't overridden
//        this.plugins.framework = framework;
        cb && cb(null);
    },
    
    _loadRoutes: function(cb) {
        this.routes = new (require('./router').Router)(this);
        this.routes.load(cb);
    }
});

// ------------------------------------------------------------------------
