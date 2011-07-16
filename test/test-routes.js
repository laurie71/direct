var assert = require('assert');
var vows = require('vows');

var U = require('../lib/api/util');
var R = require('../lib/api/resources');
var RT = require('../lib/api/routes');

var firesEvents = require('./lib').firesEvents;


vows.describe('Direct Routes').addBatch({
    'RouteError': {
        topic: RT.RoutesError('info str'),
        'isa Error': function(e) { assert.instanceOf(e, Error); },
        'isa DirectError': function(e) { assert.instanceOf(e, U.error.Error); },
        'isa ResourceError': function(e) { assert.instanceOf(e, R.ResourceError); },
        'isa ResourceFileError': function(e) { assert.instanceOf(e, R.ResourceFileError); },
        'isa RoutesError': function(e) { assert.instanceOf(e, RT.RoutesError); }
    }
}).addBatch({
    'Route': {
        topic: new RT.Route({}, 'M', 'P', 'A'),
        'constructor': {
            'sets method': function(r) { assert.equal(r.method, 'm'); },
            'sets path':   function(r) { assert.equal(r.path, 'P'); },
            'sets action': function(r) { assert.equal(r.action, 'A'); }
        },
        'handler': {
            topic: function(r) {
                // mock controller.resolve:
                var fn = function handler() {};
                r.plugin.controller = { 
                    called: false,
                    handler: function handler() { this.called = true; }, 
                    resolve: function() { return [this, 'handler']; }
                };
                
                // invoke route handler
                r.handle();
                
                return r;
            },
            'resolves action': function(r) {
                assert.isNotNull(r.handler);
            },
            'invokes controller': function(r) {
                assert.isTrue(r.plugin.controller.called);
            }
        }
    }
}).addBatch({
    'Routes': {
        topic: new RT.Routes({ id:'test-plugin', root: 'plugin-root' }),
        
        'constructor': {
            'sets ID': function(rs) { assert.equal(rs.id, 'test-plugin:routes'); },
            'sets path': function(rs) { assert.equal(rs.filename, 'plugin-root/conf/routes'); },
            'sets plugin': function(rs) { assert.isNotNull(rs.plugin); }
        },
        
        'reports RoutesError on failed load': function(rs) {
            try {
                rs.load();
                assert.fail('error expected');
            } catch (e) {
                assert.instanceOf(e, RT.RoutesError);
                assert.equal(e.filename, rs.filename);
            }
        }

    }
}).export(module);
