var path = require('path');
var plugins = require('./plugins');
var utils = require('./utils');

var defaults = {
    'config-dir': 'conf',
    'config-settings': '/settings.js',
    
    'i18n-dir': 'conf',
    'i18n-base': 'messages',
    'i18n-default': 'en',
    'i18n-locales': 'en,en_US,fr,xxx'
};

Object.freeze(defaults);

var Framework = utils.inherit(plugins.Plugin, {
    constructor: function Framework() {
        var root = path.join(__dirname, '../framework');
        utils.debug('Loading Framework ('+root+')...');
        plugins.Plugin.call(this, root);
        this._loadSettings(defaults);
        this._loadMessages();
        utils.debug('* Framework Loaded.');
    }    
});

module.exports = new Framework();
