var path = require('path');

var application = require('./framework/application');
var plugins = require('./framework/plugin');
var utils = require('./util');

/**
 * @namespace
 */
var direct = module.exports;

// ------------------------------------------------------------------------
// sub-module exports:

direct.errors = require('./errors');
direct.framework = require('./framework');
direct.i18n = require('./i18n');
//direct.template = require('./template');
direct.util = require('./util');

// ------------------------------------------------------------------------
// exported properties:

/**
 * @name {direct.framework.Application} direct.app
 */
Object.defineProperty(direct, 'app', {
    enumerable: true,
    get: function() { 
        return application.Application.instance; 
    }
});

// ------------------------------------------------------------------------
// TODO: move to new homes:

Object.freeze(defaults);

var Framework = utils.inherit(plugins.Plugin, {
    constructor: function Framework() {
        var root = path.join(__dirname, '../framework');

        utils.debug('Loading Framework ('+root+')...');
        plugins.Plugin.call(this, root);
        this.load();
        utils.debug('* Framework Loaded.');
    }    
});

module.exports = new Framework();
