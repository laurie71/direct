// var fs = require('fs');
var lib = require('jslib');
// var path = require('path');

var Properties = require('./properties').Properties;

var settings = module.exports;

settings.Settings = lib.inherit(Properties, {
    constructor: function Settings(file, parent) {
        Properties.call(this, file);
        this._parent = parent;
    },
//     
//     load: function(file, cb) {
//         var settings = require(file);
//         if (lib.typeOf(settings) !== 'object') {
//             util.error.throw('SettingsError', 
//                 ['settings files '
//                 ],
//                 {
//                     
//                 })
//         }
//     },
//     
//     get: function(key) {
//         return (this._data.hasOwnProperty(key)) ?
//             this._data[key] :
//             parent.get(key);
//     },
//     
//     set: function(key, value) {
//         this._data[key] = value;
//     },
//     
//     toString: function() {
//         return '[Settings: '+this._filenm+']';
//     }
// });
// 
// util.script.load(__dirname+'/api/Plugin.js', function(e,v,g) {
//     if (e) {
//         console.log(e.stack) 
//     } else {
//         console.dir(v);
//         console.log('---');
//         console.dir(g);
//     }
});
