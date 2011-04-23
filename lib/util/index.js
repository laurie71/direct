// ------------------------------------------------------------------------
var util = module.exports = new (function util() {});
// ------------------------------------------------------------------------

util.error = require('./error');

// ------------------------------------------------------------------------

var u = require('util');
// util.inspect = u.inspect;
util.debug = u.debug;
// util.trace = console.trace;
// // util.error = console.error;
// util.warn = console.warn;
// util.info = console.info;

/**
 * @param {Object} target
 * @param {Object} source1,source2,...
 * @return <code>target</code>
 */
util.mixin = function mixin(target) {
    var sources = Array.prototype.slice.call(arguments, 1);
    while (sources.length) {
        var source = sources.shift();
        for (var prop in source) {
            if (source.hasOwnProperty(prop)) {
                target[prop] = source[prop];
            }
        }
    }
    return target;
};

util.inherit = function inherit(sb, sp, proto) {
    if (typeof(sp) !== 'function') {
        proto = sp; 
        sp = sb;
        sb = ('constructor' in proto && proto.constructor !== Object.prototype.constructor)
            ? proto.constructor : function() { sp.apply(this, arguments); };
    }
    
    var F = function() {};
    F.prototype = sp.prototype;
    sb.prototype = new F();
    if (proto) {
        util.mixin(sb.prototype, proto);
    }
    
    sb.prototype.constructor = sb;
    sb.prototype.super_ = sb.super_ = sp.prototype;
    
    if (sp.prototype.constructor == Object.prototype.constructor) {
        sp.prototype.constructor = sp;
    }
    
    return sb;
};
