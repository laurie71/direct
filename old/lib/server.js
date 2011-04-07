var express = require('express');
var util = require('./utils');
var server = module.exports;

var defaults = {
    port: 7000
};

server.Server = util.inherit(Object, {
    constructor: function Server(config) {
        this.config = util.mixin({}, defaults, config);
        this.app = config // fixme: check for HTTPS config options
            ? new express.HTTPSServer(config)
            : new express.HTTPServer();
        this.env = this.app.env;
        
        if (this.env === 'production') {
            this.startup();
        }
    },
    
    startup: function() {
        this.app.listen(this.config.port);
    },

    shutdown: function() {}
});
