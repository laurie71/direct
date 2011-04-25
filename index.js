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