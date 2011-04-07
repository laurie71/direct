var path = require('path');

var plugins = require('./plugins');
var utils = require('./utils');

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
        framework = framework || require('./direct');
        plugins.Plugin.call(this, root);
        this.plugins = {};
        
        this.env = this.settings.env = process.env.EXPRESSIVE_ENV || process.env.NODE_ENV || 'production';
        process.env.EXPRESSIVE_ENV = process.env.NODE_ENV = this.env;

        if (this.env == 'production') {
            this._load();
        } else {
            utils.info('* Waiting for first request to initialize...');
        }
    },
    
    _loadPlugins: function() {
        this.plugins = {};
        
        // ensure core 'framework' plugin isn't overridden
        this.plugins.framework = framework;
    }
});

// ------------------------------------------------------------------------
