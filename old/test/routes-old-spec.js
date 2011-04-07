var assert = require('assert');
var vows = require('vows');

var error = require('../lib/error');
var routes = require('../lib/routes');

var suite = vows.describe('routes').addBatch({
    'Route constructor': {
        'requires an array': function() { assert.throws(function() { new routes.Route({}); }, error.ParseError); },
        'does not accept empty array': function() { assert.throws(function() { new routes.Route([]); }, error.ParseError); },
        'requires a valid method': function() { assert.throws(function() { new routes.Route(['bogus', '/path', 'c.a']); }, error.ParseError); },
        'stores single controller action as an array': function() {
            var rt = new routes.Route(['get','/path','controller.action']);
            assert.isArray(rt.actions);
            assert.length(rt.actions, 1);
            assert.equal(rt.actions[0], 'controller.action');
        },
        'initializes all fields': {
            topic: new routes.Route(['GET', '/path', 'controller.action1', 'controller.action2']),
            'converts method to lower-case': function(rt) { assert.equal(rt.method, 'get'); },
            'stores path unmodified': function(rt) { assert.equal(rt.path, '/path'); },
            'stores actions as array': function(rt) { 
                assert.isArray(rt.actions); 
                assert.length(rt.actions, 2);
            }
        }
    }
}).addBatch({
    'Routes constructor initializes but doesn\'t parse': {
        topic: new routes.Routes('/base'),
        'stores app path': function(rts) { assert.equal(rts.appPath, '/base'); },
        'stores routes path': function(rts) { assert.equal(rts.appRoutes, '/base/conf/routes.js'); },
        'sets routes to empty list': function(rts) { assert.length(rts.routes, 0); }
    },
    'Routes.load with missing routes.js': {
        topic: new routes.Routes('/invalid'),
        'reports missing routes file': function(rts) {
console.log('rts',rts);            
            rts.load(function(err) {
console.log('err',err);            
            });
        }
    }
}).export(module);