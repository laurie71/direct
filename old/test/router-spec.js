var assert = require('assert');
var vows = require('vows');

var router = require('../lib/router');

var suite = vows.describe('router').addBatch({
    'readRoutes() rejects non-array': function() {
        router.api.readRoutes({}, function(err) {
            assert.isNotNull(err);
            assert.include(err.message, 'should export an array');
        });
    },
    'readRoutes() on empty array returns empty array': function() {
        router.api.readRoutes([], function(err, routes) {
            assert.isNull(err);
            assert.isArray(routes);
            assert.length(routes, 0);
        });
    },
    'readRoutes() detects non-array route elements': function() {
        router.api.readRoutes([{'bad':'route'}], function(err, routes) {
            assert.isNotNull(err);
            assert.includes(err.message, 'not an array');
            assert.includes(err.message, '{"bad":"route"}');
        });
    },
    'readRoutes() detects missing route element parts': function() {
        router.api.readRoutes([['get', '/path']], function(err) {
            assert.isNotNull(err);
            assert.includes(err.message, '[0]');
            assert.includes(err.message, 'requires method, path, action');
            assert.includes(err.message, '["get","/path"]');            
        });
    },
    'readRoutes() detects invalid method in route': function() {
        router.api.readRoutes([['bogus', '/path', 'controller.action']], function(err) {
            assert.isNotNull(err);
            assert.includes(err.message, '[0]');
            assert.includes(err.message, 'unknown method "bogus"');
            assert.includes(err.message, '["bogus","/path","controller.action"]');            
        });
    },
    'readRoutes() detects invalid path in route': function() {
        router.api.readRoutes([['get', true, 'controller.action']], function(err) {
            assert.isNotNull(err);
            assert.includes(err.message, '[0]');
            assert.includes(err.message, 'invalid path');
            assert.includes(err.message, '["get",true,"controller.action"]');            
        });
    },
    // 'readRoutes() creates valid route configs': {
    //     topic: function() {
    //         router.api.readRoutes([
    //             ['get',     '/',            'index'],
    //             ['get',     re,             'auth'],
    //             ['post',    '/login/',      'login'],
    //             ['get',     '/user/:id',    'user']
    //         ], assertRoutes);
    //     },        
    //     function assertRoutes(err, routes) {
    //         assert.isNull(err);
    //         assert.deepEqual(routes[0], { method: 'get',  path: /^\/\/?$/,        keys: [],       action: 'index' });
    //         assert.deepEqual(routes[1], { method: 'get',  path: re,         keys: [],       action: 'auth' });
    //         assert.deepEqual(routes[2], { method: 'post', path: '/login/',  keys: [],       action: 'login' });
    //         assert.deepEqual(routes[3], { method: 'get',  path: '/user:id', keys: ['id'],   action: 'user' });
    //     }
    // }
}).export(module);
