var fs = require('fs');
var lib = require('jslib');
var resources = require('./resources');
var util = require('./util');

// ------------------------------------------------------------------------
var props = module.exports = new (function properties() {});
// ------------------------------------------------------------------------

props.PropertiesError = function(info, callee_, super_) {
    return util.error.build('PropertiesError', info, 
        callee_ || arguments.callee,
        // super_  || util.error.ParseFileError // fixme: todo: ResourceFileError
        super_  || props.PropertiesError // fixme: todo: ResourceFileError
    );
};
props.PropertiesError.prototype = util.error.ParseFileError.prototype; 
// fixme: make this not needed somehow

// ------------------------------------------------------------------------

props.Properties = lib.inherit(resources.Resource, {
    constructor: function Properties(options_, values_) {
        options_ = options_ || {};
        
        if (values_ && lib.typeOf(values_) !== 'object') {
            throw new TypeError('values: object expected');
        }
        if (typeof(options_) == 'string') {
            options_ = { filename: options_ };
        } else if (options_.parent && !(options_.parent instanceof props.Properties)) {
            throw new TypeError('options.parent: Properties instance expected');
        }
        
        this._data = values_ ? lib.clone(values_) : {};
        this._filename = options_.filename || '<inline>';
        this._parent = options_.parent || null;
        this._frozen = !!options_.frozen;
        
        // fixme: ought to be able to set up the prototype
        // chain so we don't have to walk the hierarchy 
        // manually
        //
        // var o;
        // o = this._data = {};
        // if (values_) {
        //     values_ = lib.clone(values_);
        //     o = this._data.__proto__ = values_
        // }
        // if (this._parent) {
        //     o.__proto__ = this._parent;
        // }

        if (this._frozen) {
            Object.freeze(this._data);
            Object.freeze(this);
        }
    },
    
    _load: function(cb) {
        var self = this;
        
        if (this._filename == '<inline>') {
            return cb && cb(null, this);
        }

        fs.readFile(this._filename, 'utf-8', function(err, data) {
            if (err) return cb && cb(props.PropertiesError({
                message: err.message,
                filename: self._filename
            }));
            
            try { 
                self._data = props.Properties.parse(data); 
                // return cb && cb(null, self);
                cb && cb(null, self);
                return;
            } catch (e) { 
                return cb && cb(e); 
            }
        });
    },
        
    get: function(key) {
        return this._data.hasOwnProperty(key) ?
            this._data[key] : this._parent ?
            this._parent.get(key) :
            undefined;
        // return this._data[key]; (see fixme: in ctor)
    },
    
    set: function(key, value) {
        // we don't need the check below on ES5 since we have Object.freeze()
        // if (this._frozen) throw new TypeError('properties are frozen');
        if (typeof(key) !== 'string') throw new TypeError('key: string expected');
        this._data[key] = value;
    }
});

props.Properties.EMPTY = new props.Properties({ frozen: true });

props.Properties.parse = function(data, options_) {
    if (typeof(data) !== 'string') {
        throw new TypeError('data: string required');
    }
    
    options_ = options_ || {};
    var skipre = /^\s*(?:\/\/.*)?$/,
        lines = data.split(/\n/),
        count = lines.length,
        line, key, val,
        ps = {},
        lineno = 0, 
        idx, buf;

    while (lineno < count && (line = lines[lineno++])) {
        // skip any whitespace-only or comment lines
        if (skipre.test(line)) continue;
        
        // break line into key/value
        if ((idx = line.indexOf('=')) < 0) {
            throw props.PropertiesError(
                "missing '=' in line "+lineno,
                { filename: options_.filename || '<inline>'
                , lineno: lineno
                }
            );
        }
        key = line.slice(0, idx).trim();
        val = line.slice(idx + 1).trim();

        if (! key) {
            throw props.PropertiesError(
                'expected <key> = <value> at line '+lineno, 
                { filename: options_.filename || '<inline>'
                , lineno: lineno
                }
            );
        }
        
        // handle continuations
        while (val[val.length - 1] === '\\') {
            val = val.slice(0, -1).trim();
            if (! skipre.test((line = lines[lineno++]))) {
                val = val + ' ' + line.trim();
            }
        }
        
        ps[key] = val;
    }
    
    return ps;
}

// ------------------------------------------------------------------------

props.PropertiesGroup