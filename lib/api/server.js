var express = require('express');
var path = require('path');

var HTTPServer = express.HTTPServer;
var HTTPSServer = express.HTTPSServer;

var server = module.exports = new (function server() {});

server.Server = function Server(app, options) {
    var https = (typeof(options) == 'object')
      , srv = https ? HTTPSServer : HTTPServer;

    // dynamic inheritance: set our prototype according
    // to the type of server we need to be, and call the
    // corresponding constructor
    this.__proto__.__proto__ = srv.prototype;
    https ? HTTPSServer.call(this, options, Array.prototype.slice.call(arguments, 1))
          : HTTPServer.call(this, Array.prototype.slice.call(arguments));
    
    this.configure('development', function configOptsDev() {
        this.set('errors', { dumpExceptions: true, showStack: true });    
    });

    this.configure('production', function configOptsProd() {
        this.set('errors', {});
    });
    
    this.configure(function setup() {
        this.use(express.favicon());
        this.use(express.logger());
        
        this.use('/static/css', express.compiler({ 
            src: '/public/css', enable: ['less'] }));    
        this.use('/static', express.static('/public'));
        
        this.set('view engine', 'html');
        //this.register('.html', require('jqtpl').express); // xxx switch to Dust
        this.set('view options', { layout: false });
        this.set('views', path.join(app.root, 'app/views'));

        this.use(express.bodyParser());
        this.use(express.cookieParser());
        this.use(express.methodOverride());

//        this.use(express.session({ secret: this.set('secret') })); // xxx
this.use(express.session({ secret: 'secret' })); // xxx
        this.use(this.router);
        
//        this.use(require('./lib/framework/middleware').errorHandler());
this.use(express.errorHandler(this.set('errors'))); // xxx
    });
    
    app.controller.routes.forEach(function(route) {
        this[route.method](route.path, route.handle.bind(route));
    }, this);
}
