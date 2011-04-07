var path = require('path');

var files = require('./files');
var i18n = require('./i18n');
var utils = require('./utils');
var plugins = module.exports;

// ------------------------------------------------------------------------

plugins.Plugin = utils.inherit(Object, {
    root: null, 
    settings: null,
    messages: null,
    
    constructor: function Plugin(root, parent) {
        this.root = root;
        this.parent = parent;
        this.settings = {};
        this.messages = {};
        
        this._loaded = false;
    },
    
    _load: function() {
        if (this._loaded) return;
        
        this._loadSettings();
        this._loadMessages();
        this._loaded = true;
    },
    
    _loadSettings: function(defaults) {
        if (this._loaded) return;
        
        defaults = defaults || {};
        var cdir = defaults['config-dir'] || 'conf',
            cfile = defaults['config-settings'] || 'settings.js',
            cpath = path.join(this.root, cdir, cfile),
            script;
            
        utils.debug('Loading Settings ('+cpath+")...");
        script = files.loadScriptSync(cpath);

        // TODO: error checking for sane script.exports

        this.settings = utils.mixin({}, defaults, script); // fixme: mixin means we'll have lots of duplication...
    },
    
    _loadMessages: function() {
        if (this._loaded) return;
        
        var s = this.settings,
            mdir = s['i18n-dir'] || 'conf',
            mfile = s['i18n-base'] || 'messages',
            mpath = path.join(this.root, mdir, mfile),
            locales = s['i18n-locales'],
            sets = {}, root, i, ilen,
            self = this;

        // load default messages
        utils.debug('Loading Messages [base] ('+mpath+")...");
        sets[''] = root = new i18n.MessageSet(this, '');
        if (path.exists(mpath)) {
            root._loadSync(mpath);
        }

        // load localeized messages
        if (locales) locales.split(/[, ]/).map(load);
        
        function load(l, parent) {
            var locale = i18n.Locale(l),
                id = locale.toString(),
                lparent, lpath;
                
            if (! (id in sets)) {
                parent = parent || root;
                lparent = locale.parent()
                lpath = mpath + '.' + id;
                
                if (lparent) parent = load(lparent, parent);
                utils.debug('Loading Messages ["'+id+'"] ('+lpath+")...");
                sets[id] = new i18n.MessageSet(self, locale, parent);
                
                if (path.exists(lpath)) {
                    sets[id]._loadSync(lpath);
                }
            }
            
            return sets[id];
        }
    }
});

// /** 
//  * The directory where application configuration files
//  * (settings, routes, messages, etc) live, relative to
//  * the application root.
//  */
// plugins.Application.CONFIG_DIR = '/conf';

