/** @namespace */
var framework = module.exports;

framework.cli = require('./cli');
framework.compiler = require('./compiler');

framework.Application = require('./application').Application;
// framework.DirectError
// framework.Framework
framework.Plugin = require('./plugin').Plugin;
// framework.Server

Object.defineProperty(framework, 'app', {
    enumerable: true,
    get: function() { return framework.Application.instance; }
});
