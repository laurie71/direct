var path = require('path');
var utils = require('./utils');
var controllers = module.exports;

controllers.CONTROLLER_PATH = '/controllers/';

controllers.Controller = function(req, res, next) {
    this.request = req;
    this.response = res;
    
    this.next = next;
    this.render = res.render;
    this.redirect = res.redirect;
    this.locals = req.locals = req.locals || {};
    
    this.flash = req.flash;
    this.flash.error = this.flash.bind(this, 'error');
    this.flash.warn = this.flash.bind(this, 'warn');
    this.flash.info = this.flash.bind(this, 'info');
};

controllers.Controller.inherit = function(proto) {
    return utils.inherit(controllers.Controller, proto);
};

// ------------------------------------------------------------------------

(function() {
    var cache = {}; // maps action -> [cls, fn]
    
    function resolve(appPath, action) {
        var filepath, idx, cls, fn;
    
        filepath = path.join(appPath, controllers.CONTROLER_PATH, action);
        filepath = filepath.split['.'];
        cls = filepath[0];
        fn = filepath[1];
    
        if (cls in cache) {
            cls = cache[cls];
        } else {
            try {
                cls = require(cls);
            } catch (e) {
                throw new Error('Unable to load controller: '+e.message);
            }
    
            if (! (cls instanceof controllers.Controller)) {
                cls = controllers.Controller.inherit(cls);
            }
    
            cache[cls] = cls;
        }
    }
    
    controllers.Controller.resolve = resolve;
}());
