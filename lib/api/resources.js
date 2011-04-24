// =========
// = TODO: =
// =========
// * remove 'load' event and rename 'ready' to 'load' or 'loaded'

var lib = require('jslib');
var events = require('events');
var util = require('./util');

// ------------------------------------------------------------------------
var resources = module.exports = new (function resources() {});
// ------------------------------------------------------------------------

resources.ResourceError = function ResourceError(info, callee_, super_) {
    return util.error.build('ResourceError', info, 
        callee_ || arguments.callee, 
        // super_ || util.error.Error
        // super_ || ResourceError
        super_ || resources.ResourceError
    );
};
resources.ResourceError.prototype = util.error.Error.prototype; // fixme: make this not needed somehow

// ------------------------------------------------------------------------

resources.Resource = lib.inherit(events.EventEmitter, {
    constructor: function Resource(id) {
        Object.defineProperty(this, 'id', { enumerable: true, value: id });
    },
    
    load: function(cb) {
        var self = this;
        
        function error(e) { cb ? cb(e) : self.emit('error', e, self); };
        
        try {
            self.emit('load', self);
            self._load(function(err) {
                if (err) return error(err);
                self.emit('ready', self);
                cb && cb(null, self);
            });
        } catch (e) {
            error(e);
        }
    },
    
    _load: function(cb) {
        cb && cb(null);
    }
});

// ------------------------------------------------------------------------
