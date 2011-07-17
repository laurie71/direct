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
    }
});

// TODO: memoize resolve()