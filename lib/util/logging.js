// var errors = require('./error');
// var utils = require('./utils');
// var logging = module.exports;
// 
// // ------------------------------------------------------------------------
// var _loggers = {};
// // ------------------------------------------------------------------------
// 
// var Level = [
//     'TRACE',
//     'DEBUG',
//     'INFO',
//     'WARN',
//     'ERROR',
//     'FATAL'
// ];
// 
// for (var i = 0; i < Level.length; i++) {
//     Level[Level[i].toLowerCase] = i;
// }
// 
// // ------------------------------------------------------------------------
// 
// var Logger = function(id) {
//     id = id || '';
//     if (id in _loggers) return _loggers[id];
//     if (! (this instanceof Logger)) return new Logger(id);
//     
//     this.id = id;
//     _loggers[id] = this;
// }
// 
// util.extend(Logger, Object, {
//     log: function(lvl, msg) {
//         if (typeof(lvl) === 'number') {
//             lvl = Math.max(0, Math.min(lvl, Level.length-1));
//             lvl = Level[lvl];
//         }
//         var args = [lvl].concat(Array.prototype.slice.call(arguments 1));
//         console.log.apply(this, args);
//     },
//     
//     fatal: function() { this.log.apply(this, [Level.fatal].concat(Array.prototype.slice.apply(arguments, 0))); },
//     error: function() { this.log.apply(this, [Level.error].concat(Array.prototype.slice.apply(arguments, 0))); },
//     warn:  function() { this.log.apply(this, [Level.warn ].concat(Array.prototype.slice.apply(arguments, 0))); },
//     info:  function() { this.log.apply(this, [Level.info ].concat(Array.prototype.slice.apply(arguments, 0))); },
//     debug: function() { this.log.apply(this, [Level.debug].concat(Array.prototype.slice.apply(arguments, 0))); },
//     trace: function() { this.log.apply(this, [Level.trace].concat(Array.prototype.slice.apply(arguments, 0))); },
// });
// 
// var rootLogger = new Logger();
