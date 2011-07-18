var api = require('./lib/api');

/** @namespace The root namespace of the Direct Web Framework api. */
var direct = module.exports = new (function direct() {});

direct.api = api;
direct.framework = new api.framework.Framework();
direct.util = require('./lib/api/util');

Object.defineProperty(direct, 'app', { 
    enumerable: true, 
    configurable: true, 
    
    get: function() { 
        throw new util.error.Error('no application loaded'); 
    },
    
    set: function(v) { 
        Object.defineProperty(this, 'app', { 
            enumerable: true, value: v
        }); 
    }
});

// ------------------------------------------------------------------------

direct.start = function(root) {
    var Application = direct.api.application.Application;
      
    direct.util.log.info('Framework loading...');
    direct.framework.on('ready', frameworkReady);
    direct.framework.load();

    function frameworkReady() {
        direct.util.log.info('Application loading...')
        var app = new Application(root, direct.framework);
        app.on('error', function dump(err) { 
            if (err) {
                console.error(err.stack || err);
                dump(err.cause);
            }
        });
        app.on('ready', appReady);
        direct.app = app;
        app.load();
    }

    function appReady() {
        direct.util.log.info('Starting server...');
        var srv = new direct.api.server.Server(direct.app);
    
        srv.on('listening', function() {
            console.log('Direct Web Framework listening at http://%s:%d/',
                srv.address().addr, srv.address().port);
        });
    
        srv.listen(5000);
    }
}

// ------------------------------------------------------------------------
/*
+ direct.api.Resource                       // [#id] identifiable, async-loadable resource
  + direct.api.ResourceHash                 // [#id:#key] 
  + direct.api.ResourceList                 // [#id:#n]
  + direct.api.ResourceTree                 // [#id:#n]

+ direct.api.parser.???

  
  
    + direct.api.PropertySet
  + direct.api.ContainerResource
    + direct.api.Application
    + direct.api.Framework
    + direct.api.Plugin
  

direct.framework = new direct.api.Framework(path.join(__dirname, 'framework'));
direct.app = new direct.api.Application(path.join(process.CWD, argv[2]));

async.series(
    [ direct.framework.load
    , direct.app.load
    ],
    function(err) {
        if (err) {
            console.error(err.stack);
            process.exit(-1);
        }
    }
);
*/