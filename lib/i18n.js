var fs = require('fs');
var path = require('path');

var error = require('./errors');
var utils = require('./util');

var i18n = module.exports;

// ------------------------------------------------------------------------

/**
 * 
 *
 * @constructs
 * @param {String} message
 * @param {[Object]} props
 * @param {[String]} props.name
 * @param {[Error|String]} props.cause
 * @param {[direct.error.SourceInfo]} props.source
 */
i18n.MessageError = function(msg, source) {
    return error.DirectError(msg, { source: source });
}

// ------------------------------------------------------------------------

i18n.Locale = utils.inherit(Object, {
    language: null,
    region: null,
    variant: null,
    
    constructor: function Locale(language, region, variant) {
        var locale;
        
        if (! language) {
            throw new TypeError('Invalid Locale: '+JSON.stringify(arguments));
        }
        
        // return memoized locale if we have it
        locale = i18n.Locale._lookup(language, region, variant);
        if (locale != null) return locale;
        
        // otherwise, create a new locale...
        if (! (this instanceof i18n.Locale)) {
            return new Locale(language, region, variant);
        }
        
        this.language = language.toString();
        this.region   = region ? region.toString() : undefined;
        this.variant  = variant ? variant.toString() : undefined;
        Object.freeze(this);        
        
        // ...and memoize it
        i18n.Locale._memoized[this.toString()] = this;
    },
    
    toString: function() {
        return i18n.Locale._toString(this.language, this.region, this.variant);
    },
    
    parent: function() {
        if (this.variant) return i18n.Locale(this.language, this.region);
        if (this.region) return i18n.Locale(this.language);
        return null;
    }
});

i18n.Locale._memoized = {};

i18n.Locale._toString = function(l, r, v) {
    var locale = l;
    if (r) locale += '_' + r;
    if (v) locale += '_' + v;
    return locale;
};

i18n.Locale._lookup = function(l, r, v) {
    var locale = i18n.Locale._toString(l, r, v);
    return (locale in i18n.Locale._memoized) 
        ? i18n.Locale._memoized[locale]
        : null;
};

i18n.Locale.en_US = new i18n.Locale('en', 'US');

i18n.Locale.parse = function(str) {
    var parts, l,r,v;
    parts = str.split(/[_-]/);
    
    l = parts[0]; 
    r = parts[1]; 
    v = (l && r) 
        ? str.slice(2 + l.length + r.length)
        : str.slice(1 + l.length);
        
    parts = [l];
    if (r) parts[1] = r;
    if (v) parts[2] = v;
        
    return i18n.Locale._memoized[parts.join('_')] || new i18n.Locale(l, r, v);
}

// ------------------------------------------------------------------------

i18n.Messages = utils.inherit(Object, {
//     constructor: function(basePath, defaultLocale) {
//         this.basePath = basePath;
//         this.defaultLocale = defaultLocale || i18n.Locale.en_US;
//         this._messageSets = {};
//     },
//     
//     loadMessageSets(locale, cb) {
//         xxx
//     },
//     
//     getMessages: function(locale) {
//         locale = locale.toString();
//         return this._messageSets[locale];
//     },
//     
//     get: function(locale, key) {
//         locale = locale
//     }
});

i18n.MessageSet = utils.inherit(Object, {
    constructor: function MessageSet(app, locale, parent) {
        this._app = app;
        this._locale = locale;
        this._parent = parent;
        this._messages = null;
        
        if (locale && typeof(locale) === 'string') {
            locale = i18n.Locale(locale);
        }
    },
    
    // load: function(cb) {
    //     
    // },
    
    _loadSync: function(path) {
        var data = fs.readFileSync(path, 'utf-8');
        return this._parse(path, data);
    },
    
    // _load: function(path, cb) {
    //     var self = this;
    //     fs.readFile(path, 'utf-8', function(err, data) {
    //         if (! err) {
    //             try { 
    //                 data = self._parse(path, data));
    //             } catch (e) { 
    //                 err = e; 
    //             }
    //         }
    //         return err ? cb(err) : cb(null, data);
    //     });
    // },
    
    _parse: function(file, lines) {
        var lines = lines.split(/^/m),
            count = lines.length,
            index = -1,
            line, split,
            key, val, 
            dict = {};

        while (++index < count) {
            line = lines[index];
            // if (line.match(/^(\s*)?(#.*)?$/m)) continue; // skip blanks/comments
            if (line.match(/^\s*($|#)/)) continue; // skip blanks/comments
            
            split = line.indexOf('=');
            key = line.slice(0, split).trim();
            val = line.slice(split + 1).trim();

            if (split < 0) throw i18n.MessageError(
                'Invalid I18N message: missing "="',
                error.SourceInfo(file, index, 0));
            if (split == 0) throw i18n.MessageError(
                'Invalid I18N message: no key before "="',
                error.SourceInfo(file, index, 0));
            if (! line.slice(split+1).trim()) throw i18n.MessageError(
                'Invalid I18N message: no message following "="',
                error.SourceInfo(file, index, split+1));
            if (key in dict) throw i18n.MessageError(
                'Invalid I18N message: duplicate key "'+key+'"',
                error.SourceInfo(file, index, 0));
            
            dict[key] = val;
        }
        
        return dict;
    },
    
    get: function(key) {
        var message, parent;
        
        // return local message if we have it
        if (this._messages && (key in this._messages)) {
            message = this._messages[key];
            if (arguments.length > 1) {
                // TODO: param substitution
            }
            return message;
        }
        
        // fetch from parent if we have one
        if (this._parent) {
            return this._parent.get.apply(this._parent, arguments);
        }
        
        // fallback to the key itself as last resort
        return key;
    }
});

i18n.MessageSet._cache = {};