var async = require('async');
var lib = require('jslib');
var path = require('path');
var util = require('./util');

var resources = require('./resources');
var Settings = require('./settings').Settings;

var plugins = module.exports;


plugins.PluginError = function(info, callee_, super_) {
    return util.error.build('PluginError', info, 
        callee_ || arguments.callee,
        super_ || resources.ResourceError
    );
};
plugins.PluginError.prototype = resources.ResourceError.prototype; // fixme: make this not needed somehow


plugins.Plugin = lib.inherit(resources.Resource, {
    name: null,
    root: null, 
    settings: null,
    messages: null,
    
    constructor: function Plugin(root, parent) {
        var _p_ = {
            configurable: true,
            enumerable: false,
            get: function() {
                throw this._error('property unavailable until loaded', arguments.callee);
            }
        };

        Object.defineProperty(this, 'name', { enumerable: true, value: path.basename(root) });
        Object.defineProperty(this, 'root', { enumerable: true, value: root });
        Object.defineProperty(this, 'parent', { enumerable: true, value: parent });
        Object.defineProperty(this, 'settings', _p_);
        Object.defineProperty(this, 'messages', _p_);
        
        this._loaded = false;
        
        resources.Resource.call(this, this.name);
    },
    
    _error: function(message, callee_) {
        return plugins.PluginError(message, callee_ || arguments.callee);
    },
    
    _load: function(cb) {
        if (this._loaded) {
            throw this._error('already loaded');
        }
        
        async.series(
            [ this._loadSettings.bind(this)
            , this._loadDependencies.bind(this)
            , this._loadMessages.bind(this)
            ], 
            function loaded(err) {
                if (err) return cb && cb(err);
                this._loaded = true;
                cb && cb(null, this);
            }
        );
    },
    
    _loadSettings: function(cb) { 
        var sfile = path.join(this.root, 'conf/settings.props'),
            psettings = this.parent && this.parent.settings,
            settings = new Settings(sfile, psettings);
console.info('-- load settings: '+sfile);
            
        Object.defineProperty(this, 'settings', {
            enumerable: true, value: settings
        });

        path.exists(sfile, function(exists) {
            if (exists) {
                // settings.load(cb);
                settings.load(function(err, s) {
                    cb(err);
                });
            } else {
console.warn('-- load settings: file note found');
                cb && cb(null, settings);
            }
        });
    },
    
    _loadDependencies: function(cb) {  // todo
console.log('...load deps...');
        cb && cb(null); 
    },
    
    _loadMessages: function(cb) {
        var sfile = path.join(this.root, 'conf/messages.props'),
            messages = new Settings(sfile); // xxx should be a MessageBundle
console.info('-- load messages: '+sfile);
            
        Object.defineProperty(this, 'messages', {
            enumerable: true, value: messages
        });

        path.exists(sfile, function(exists) {
            if (exists) {
                messages.load(cb);
            } else {
console.warn('-- load messages: file note found');
                cb && cb(null, messages);
            }
        });
    },
    
    toString: function() { 
        var _t_ = this.__proto__.constructor.name || 'Plugin',
            _n_ = this.name || 'unknown';
        return '['+_n_+' '+_t_+']'; 
    }
});




// var plugin = new plugins.Plugin(process.cwd()+'/test/plugins/test-plugin');
// // early access to async properties throws error:
// // console.log('plugin settings:');
// // console.log(plugin.settings);
// console.log('loading plugin '+plugin.name+'...');
// plugin.load(function(err) {
//     if (err) { 
//         console.log(err.stack); 
//     } else {
//         console.log('plugin '+plugin.name+' loaded.');
//         console.log('-- settings: '+JSON.stringify(plugin.settings));
//         console.log('-- messages: '+JSON.stringify(plugin.messages));
//     }
// });

// function Application() { plugins.Plugin.apply(this, arguments); };
// var App = lib.inherit(Application, plugins.Plugin, {
//     _error: function(message, callee_) {
//         var err = plugins.PluginError(message, callee_ || arguments.callee);
//         err.name = 'ApplicationError';
//         return err;
//     },
// });
// app = new App();
// console.log('app settings:');
// console.log(app.settings);
