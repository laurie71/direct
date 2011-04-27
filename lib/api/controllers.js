var lib = require('jslib');
var path = require('path');

// ------------------------------------------------------------------------
var controller = module.exports = new (function controller() {});
// ------------------------------------------------------------------------

// controller.ControllerAction = lib.inherit(Object, {
//     constructor: function ControllerAction() {}
// });

controller.Controller = lib.inherit(Object, {
    constructor: function Controller(app) {
        this.app = app;
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
    }
});

// TODO: memoize resolve()