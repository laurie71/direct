var utils = module.exports;

var u = require('util');
utils.inspect = u.inspect;
utils.debug = u.debug;
utils.trace = console.trace;
utils.error = console.error;
utils.warn = console.warn;
utils.info = console.info;

/**
 * @param {Object} target
 * @param {Object} source1,source2,...
 * @return <code>target</code>
 */
utils.mixin = function mixin(target) {
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

utils.inherit = function inherit(sb, sp, proto) {
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
        utils.mixin(sb.prototype, proto);
    }
    
    sb.prototype.constructor = sb;
    sb.prototype.super_ = sb.super_ = sp.prototype;
    
    if (sp.prototype.constructor == Object.prototype.constructor) {
        sp.prototype.constructor = sp;
    }
    
    return sb;
};
