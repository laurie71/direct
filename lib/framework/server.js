var express = require('express');
var utils = require('./utils');
var server = module.exports;

var defaults = {
    port: 7000
};

server.Server = utils.inherit(Object, {
    constructor: function Server(config) {
        this.config = utils.mixin({}, defaults, config);
        this.app = config // fixme: check for HTTPS config options
            ? new express.HTTPSServer(config)
            : new express.HTTPServer();

        this.env = this.app.set('env');
        
        console.log('Direct Server mode: '+this.env+' / '+process.env.NODE_ENV);
        
        var app = this.app;
        this._running = false;
        this.app.on('listening', function() {
            this._running = true;
            var addr = app.address();
            console.log('Direct Server listening at http://%s:%d/', 
                addr.address, addr.port);
        });
        app.on('close', function() {
            this._running = false;
            console.log('Direct Server shut down.');
        });

        if (this.env === 'production') {
            this.startup();
        }
    },
    
    startup: function() {
        if (! this._running) {
            console.log('Direct Server starting up...');
            this.app.listen(this.config.port);
        }
    },

    shutdown: function() {
        if (this._running) {
            console.log('Direct Server shutting down...');
            this.app.close();
        }
    }
});
