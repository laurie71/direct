var path = require('path');
//var direct = require('direct');
var direct = require('./index');

// ------------------------------------------------------------------------

var APPROOT = path.join(__dirname, 'test/fixtures/test-app');

// ------------------------------------------------------------------------

function start() {
    direct.util.log.info('Framework loading...');
    direct.framework.on('ready', frameworkReady);
    direct.framework.load();
}

function frameworkReady() {
    direct.util.log.info('Application loading...')
    var app = new direct.api.application.Application(APPROOT, direct.framework);
    app.on('error', function dump(err) { 
        if (err) {
            console.error(err.stack || err);
            dump(err.cause);
        }
    });
    app.on('ready', appReady);
    direct.app = app;
    app.load();
}

function appReady() {
    direct.util.log.info('Starting server...');
    var srv = new direct.api.server.Server(direct.app);
    
//srv.get('/', function(req, res) { res.render('index'); });    
    
    srv.on('listening', function() {
        console.log('Direct Web Framework listening at http://%s:%d/',
            srv.address().addr, srv.address().port);
    });
    srv.listen(5000);
}

// ------------------------------------------------------------------------
// ------------------------------------------------------------------------
start();
// ------------------------------------------------------------------------
// ------------------------------------------------------------------------
