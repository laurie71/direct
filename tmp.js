var DEBUG = function() {
    require('util').debug('>>> tmp.js: '+
        Array.prototype.join.call(arguments, ' '));
}

// ------------------------------------------------------------------------
// DEBUG('load lib/direct');
// var direct = require('./lib/direct');
DEBUG('load lib/application');
var eapp = require('./lib/application');
DEBUG('create direct app');
new eapp.Application(__dirname+'/examples/helloworld'/* , direct*/);
DEBUG('done');

DEBUG('++++++++++');
DEBUG('legacy startup follows');
DEBUG('++++++++++');

// ------------------------------------------------------------------------


var express = require('express');
var app = express.createServer();

var appRoot = __dirname+'/examples/helloworld';
DEBUG('*** appRoot is '+appRoot);

// ------------------------------------------------------------------------
// Configuration

app.configure(function configOpts() {
    DEBUG('Direct: setting configuration options (global)...');
    
    app.set('app/controllers',  appRoot + '/app/controllers');
    app.set('app/models',       appRoot + '/app/models');
    app.set('app/views',        appRoot + '/app/views');
    
    app.set('static root',      '/static');
    app.set('public root',      appRoot + '/public');
    app.set('public/css',       appRoot + '/public/css');
    // app.set('public/js',        appRoot + '/public/js');
    
    app.set('secret', '@secret@');
});

app.configure('development', function configOptsDev() {
    DEBUG('Direct: setting configuration options (development)...');
    app.set('errors', { dumpExceptions: true, showStack: true });    
});

app.configure('production', function configOptsProd() {
    DEBUG('Direct: setting configuration options (production)...');
    app.set('errors', {});
});

// ------------------------------------------------------------------------
// Setup

app.configure(function setupStatic() {
    DEBUG('Direct: configuring static services...');
    
    var publicRoot = app.set('public root'),
        staticRoot = app.set('static root'),
        cssRoot = app.set('public/css');

    app.use(express.favicon());
    app.use(express.logger());
    
    // app.use(staticRoot+'/css', express.compiler({ 
    app.use(staticRoot+'/css', require('./lib/compiler')({ 
        src: cssRoot, 
        enable: ['less'] 
    }));    
    app.use(staticRoot, express.static(publicRoot));
});

app.configure(function setupDynamic() {
    DEBUG('Direct: configuring dynamic services...');
    
    app.set('view options', { layout: false });
    app.set('views', app.set('app/views'));
    app.set('view engine', 'html');
    app.register('.html', require('jqtpl'));
    
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());
    
    app.use(express.session({ secret: app.set('secret') }));
    app.use(require('./lib/router').router(app, appRoot));
});

app.configure(function setupErrorHandling() {
    DEBUG('Direct: configuring error handling...');
    app.use(require('./lib/error').handler());
    // app.use(express.errorHandler(app.set('errors'))); 
});

// ------------------------------------------------------------------------
app.all('/', function(req, res) { res.render('index'); });
// ------------------------------------------------------------------------
// Startup

app.on('listening', function() {
    DEBUG("Direct: Server listening at http://%s:%d/", 
        app.address().address, app.address().port
    );
});

app.listen(3000);





// var s = require('./lib/server');
// var svr = new s.Server();
// svr.startup();
// 
// setTimeout(function() {
//     svr.shutdown();
// }, 5000);