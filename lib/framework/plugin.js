var async = require('async');
var path = require('path');

var i18n = require('../i18n');
var resources = require('../resources');
var scripts = require('../util/script');
var utils = require('../util');

// ------------------------------------------------------------------------
var plugins = module.exports = new (function plugins() {});
// ------------------------------------------------------------------------

plugins.Plugin = utils.inherit(resources.Resource, {
    root: null, 
    settings: null,
    messages: null,
    
    constructor: function Plugin(root, parent) {
        resources.Resource.call(this, path.basename(root));
        
        this.root = root;
        this.parent = parent;
        this.settings = {};
        this.messages = {};
        
        this._loaded = false;
    },
    
    _load: function(cb) {
        if (this._loaded) return;
        
        async.series(
            [ this._loadSettings.bind(this)
            , this._loadMessages.bind(this)
            ],
            function loaded(err) {
                if (err) return cb ? cb(err) : self.emit('error', err);
                this._loaded = true;
                cb && cb(null, this);
            }
        );
    },
    
    _loadSettings: function(cb) {
        if (this._loaded) return cb && cb(null);
        
        var cpath = path.join(this.root, 'conf/settings.js'),
            script;
            
        utils.debug('Loading Settings ('+cpath+")...");
        script = scripts.loadScriptSync(cpath);

        // TODO: error checking for sane script.exports

        this.settings = script;
        
        cb && cb(null);
    },
    
    _loadMessages: function(cb) {
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

        // load localized messages
        if (locales) locales.split(/[, ]/).map(load);
        
        // signal complete
        cb && cb(null);
        
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

