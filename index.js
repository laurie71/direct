/** @namespace The root namespace of the Direct Web Framework api. */
var direct = module.exports;

// export all symbols from lib/api 
var n, api = require('./lib/api');
for (n in api) if (api.hasOwnProperty(n)) {
    direct[n] = api[n];
}
