var fs = require('fs');
var path = require('path');
var utils = require('./utils');

// ------------------------------------------------------------------------
module.exports = router;
// ------------------------------------------------------------------------

var methods = require('express').router.methods;
methods = methods.concat(['del', 'all', '*']);


// ------------------------------------------------------------------------
// Internal API (exported for unit testing)

router.api = {
    loadRoutes: loadRoutes,
    readRoutes: readRoutes,
    normalizePath: normalizePath
}

function badRoute(i, route, msg) {
    return new Error(
        'Invalid route ['+i+'] ' +
        '(' + msg + '):\n' +
        JSON.stringify(route)
    );
}

function loadRoutes(appRoot, cb) {
    var filepath = path.join(appRoot, '/conf/routes.js'),
        routes;
    
    if (! path.exists(filepath)) {
        return cb(new Error('Missing <app>/conf/routes.js'));
    }
    
    try {
        routes = require(filepath);
    } catch (e) {
        return cb(e);
    }
    
    cb(null, routes);
}

function readRoutes(routes, cb) {
    var rts = [], rt, i, ilen, 
        method, path, keys, action;
    
    if (typeof(cb) !== 'function') {
        throw new TypeError('invalid callback');
    }
    
    if (! Array.isArray(routes)) {
        return cb(new Error('<app>/conf/routes.js: should export an array.'));
    }
    
    for (var i = 0, ilen = routes.length; i < ilen; i++) {
        rt = routes[i];
        
        if (! Array.isArray(rt)) {
            return cb(badRoute(i, rt, 'not an array'));
        }
        if (rt.length < 3) {
            return cb(badRoute(i, rt, 'requires method, path, action'));
        }
        
        method = rt[0];
        path = rt[1];
        keys = [];
        action = Array.prototype.slice.call(rt, 2);

        if (methods.indexOf(method) < 0) {
            return cb(badRoute(i, rt, 'unknown method '+JSON.stringify(method)));
        }
        if (! (path instanceof RegExp)) {
            if (typeof(path) !== 'string') {
                return cb(badRoute(i, rt, 'invalid path; must be String or RegExp'));
            }
            path = normalizePath(path, keys);
        }
        
        rts.push({
            method: method,
            path: path,
            keys: keys,
            action: action
        });
    }
    
    return cb(null, rts);
}

/**
 * Normalize the given path string,
 * returning a regular expression.
 *
 * An empty array should be passed,
 * which will contain the placeholder
 * key names. For example "/user/:id" will
 * then contain ["id"].
 *
 * @param  {String} path
 * @param  {Array} keys
 * @return {RegExp}
 * @api private
 */
function normalizePath(path, keys) {
  // NOTE: function taken directly from connect middleware;
  // it's not exposed so all we can do is copy-paste it :(
  path = path
    .concat('/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
      keys.push(key);
      slash = slash || '';
      return ''
        + (optional ? '' : slash)
        + '(?:'
        + (optional ? slash : '')
        + (format || '') + (capture || '([^/]+?)') + ')'
        + (optional || '');
    })
    .replace(/([\/.])/g, '\\$1')
    .replace(/\*/g, '(.+)');
  return new RegExp('^' + path + '$', 'i');
}




