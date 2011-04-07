var path = require('path');
var parse = require('url').parse;

var error = require('../errors');
var utils = require('../util');

// ------------------------------------------------------------------------

module.exports.router = router;

// ------------------------------------------------------------------------

function router(app, appRoot) {
    var app = app,
        root = appRoot,
        routes = null,
        router = null;
    
app.root = appRoot;//xxx
    router = new module.exports.Router(app);
    
    // function load(cb) {
    //     loadRoutes(appRoot, function(err, rs) {
    //         if (err) return cb(err);
    //         routes = rs;
    //         cb(null);
    //     });
    // }
    
    function route(req, res, next) {
        var route = match(req, router.routes);
        if (route) {
            resolve(app.set('app/controllers'), route, function(err, action) {
                if (err) return next(err);

                var controller = action[0],
                    action = action[1];
                    
                try { controller[action].call(controller, req, res, next); }
                catch (e) { next(e); }
            });
        } else {
            next();
        }
    }
    
    return function(req, res, next) {
        if (routes === null) {
            // lazy init
            router.load(function(err) {
                return err 
                    ? next(err) 
                    : route(req, res, next);
            });
        } else {
            route(req, res, next);
        }
    }
}

// ------------------------------------------------------------------------

module.exports.Router = utils.inherit(Object, {
    plugin: null,
    routes: null,
    
    constructor: function(plugin) {
        this.plugin = plugin;
        this.routes = null;
    },
    
    load: function(cb) {
        var self = this;
        utils.debug('Loading routes from '+this.plugin.root);
        loadRoutes(this.plugin.root, function(err, rs) {
            if (err) return cb(err);
            self.routes = rs;
            cb(null);
        });
    }
});

// ------------------------------------------------------------------------
// Internal API helpers

var methods = require('express').router.methods;
methods = methods.concat(['del', 'all', '*'])
    .map(function(m) { return m.toUpperCase(); });

function RouteError(file, routes, index, msg) {
    return error.DirectError(
        'Invalid route [' + index + '] (' + msg + ')',
        { name: 'RouteError'
        , source: error.SourceInfo(file, index)
        , detail: error.SourceDetail(JSON.stringify(routes, null, 2))
        , routes: routes
        }
    );
}

function loadRoutes(appRoot, cb) {
    var file = 'conf/routes.js',
        filepath = path.join(appRoot, file),
        routes;
    
    try {
        routes = require(filepath);
    } catch (e) {
        return cb(e);
    }
    
    readRoutes(file, routes, cb);
}

function readRoutes(file, routes, cb) {
    var rts = {}, rt, i, ilen, j, jlen,
        method, path, keys, action;
    
    if (! Array.isArray(routes)) {
        return cb(new Error(file+' should export an array.')); // fixme throw RouteError
    }
    
    if (! routes.length) return cb(null, []);

utils.debug('Reading Routes...');
    for (var i = 0, ilen = routes.length; i < ilen; i++) {
        rt = routes[i];
utils.debug('... '+JSON.stringify(rt));
        
        if (! Array.isArray(rt)) {
            return cb(RouteError(file, routes, i, 
                'not an array'));            
        }
        if (rt.length < 3) {
            return cb(RouteError(file, routes, i, 
                'requires method, path, action'));
        }
        
        method = rt[0];
        path   = rt[1];
        action = rt[2];
        keys   = [];
        
        method = method.toUpperCase();
        
        if (methods.indexOf(method) < 0) {
utils.debug('methods:\n'+utils.inspect(methods));
            return cb(RouteError(file, routes, i, 
                'unknown method '+JSON.stringify(method)));
        }
        if (! (path instanceof RegExp)) {
            if (typeof(path) !== 'string') {
                return cb(RouteError(file, routes, i, 
                    'invalid path; must be String or RegExp'));
            }
            path = normalizePath(path, keys);
        }
        
        if (method === '*') {
            method = methods;
        } else {
            method = method.toUpperCase();
            if (method === 'ALL') {
                method = methods;
            } else if (method === 'DEL') {
                method = ['DELETE'];
            } else {
                method = [method];
            }
        }

utils.debug('route: '+utils.inspect(rt));
        
        for (j = 0, jlen = method.length; j < jlen; j++) {
            if (method[j] === 'ALL') continue;
            if (method[j] === 'DEL') continue;
            
            rts[method[j]] = rts[method[j]] || [];
            rts[method[j]].push({
                method: method[j],
                path: path,
                keys: keys,
                action: action
            });
utils.debug('--> '+JSON.stringify(rts[method[j]].slice(-1))); 
        }
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
  //
  // NOTE: function taken directly from connect middleware;
  // it's not exposed so all we can do is copy-paste it :(
  //
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

function match(req, routes) { // TODO: this is first match wins; need to swtich to best match wins
    var method = req.method
        
    if ('HEAD' == method) method = 'GET';
    
//utils.debug(utils.inspect(routes));
utils.debug('matching routes for: '+method+' '+parse(req.url).pathname);
    if (routes = routes[method]) {
        var url = parse(req.url),
            pathname = url.pathname,
            i, ilen, route, fn,path,keys,captures,
            j, jlen, key, val;
            
        for (i = 0, ilen = routes.length; i < ilen; i++) {
            route = routes[i];
            // fn = route.fn;
            action = route.action; // xxx
            path = route.path;
            keys = route.keys;
utils.debug('-- route path: '+path+' '+JSON.stringify(route));
            
            if (captures = path.exec(pathname)) {
utils.debug('-- matches');
                route._params = []; // xxx
                for (j = 1, jlen = captures.length; j < jlen; j++) {
                    key = keys[j-1];
                    val = typeof(captures[j]) === 'string'
                        ? decodeURIComponent(captures[j])
                        : captures[j];
                    if (key) {
                        route._params[key] = val; // xxx
                    } else {
                        route._params.push(val); // xxx
                    }
                }
                return route;
            }
        }
    }
utils.debug('* no matching routes *');
}

function resolve(basePath, route, cb) { // TODO: move to Controller.resolve()
    var cpath = basePath,
        action = route.action,
        mod;
    
    action = action.split('.');
    if (action.length == 1) {
        mod = 'application';
        action = action[0];
    } else {
        mod = action[0];
        action = action[1];
    }
    
console.log('controller path: ', cpath);
console.log('module is: ', mod);
    cpath = path.join(cpath, '/' + mod);
console.log('module path: ', cpath);
    try { mod = require(cpath); }
    catch (e) { return cb(e); }
    
    if (typeof(mod[action]) !== 'function') {
console.log('bad action',action,mod);
        return cb(new Error('invalid action'+JSON.stringify(action)));
    }
    
    cb(null, [mod, action]);
}

