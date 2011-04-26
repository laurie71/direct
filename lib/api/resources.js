// =========
// = TODO: =
// =========
// * remove 'load' event and rename 'ready' to 'load' or 'loaded'

var async = require('async');
var fs = require('fs');
var lib = require('jslib');
var events = require('events');
var util = require('./util');

// ------------------------------------------------------------------------
var resources = module.exports = new (function resources() {});
// ------------------------------------------------------------------------

resources.ResourceError = function ResourceError(info, callee_, super_) {
    return util.error.build('ResourceError', info, 
        callee_ || arguments.callee, 
        super_ || resources.ResourceError
    );
};
resources.ResourceError.prototype = util.error.Error.prototype; // fixme: make this not needed somehow

resources.ResourceFileError = function ResourceError(info, callee_, super_) {
    return util.error.build('ResourceFileError', info, 
        callee_ || arguments.callee, 
        super_ || resources.ResourceFileError
    );
};
resources.ResourceFileError.prototype = resources.ResourceError.prototype; // fixme: make this not needed somehow

// ------------------------------------------------------------------------

resources.Resource = lib.inherit(events.EventEmitter, {
    constructor: function Resource(id) {
        Object.defineProperty(this, 'id', { enumerable: true, value: id });
    },
    
    toString: function() { return '[#'+this.id+' Resource]' },
    
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

resources.ResourceFile = lib.inherit(resources.Resource, {
    constructor: function ResourceFile(id, filename) {
        Object.defineProperty(this, 'id', { enumerable: true, value: id });
        Object.defineProperty(this, 'filename', { enumerable: true, value: filename });
    },
    
    _load: function(cb) {
        try {
            var self = this, err = null;
            self._loadFile(function(err, data) {
                if (err) return cb ? cb(err) : self.emit('error', err);
                self._parse(data, function(err) {
                    if (err) return cb ? cb(err) : self.emit('error', err);
                    cb && cb(null);
                });
            });
        } catch (e) {
            if (! (e instanceof resources.ResourceError)) {
                e = resources.ResourceFileError({
                    filename: this.filename,
                    message: e.message,
                    cause: e
                });
            }
            throw e;
        }
    },

    _loadFile: function(cb) {
        fs.readFile(this.filename, 'utf-8', function(err, data) {
            if (err) {// && err.code !== 'ENOENT') {
                err = resources.ResourceFileError({
                    filename: this.filename,
                    message: err.message,
                    cause: err
                });
                cb && cb(err, data);
            } else {
                cb(null, data || '');
            }
        });
    },

    _parse: function(data, cb) {
        cb && cb(null);
    }
});

// ------------------------------------------------------------------------
