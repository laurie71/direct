var assert = require('assert');
var vows = require('vows');

var U = require('direct/lib/api/util');
var R = require('direct/lib/api/resources');
var P = require('direct/lib/api/plugins');

var firesEvents = require('./lib').firesEvents;


vows.describe('Direct Plugins').addBatch({
    'PluginError': {
        topic: P.PluginError('info str'),
        'isa Error': function(e)         { assert.instanceOf(e, Error); },
        'isa DirectError': function(e)   { assert.instanceOf(e, U.error.Error); },
        'isa ResourceError': function(e) { assert.instanceOf(e, R.ResourceError); },
        'isa PluginError': function(e)   { assert.instanceOf(e, P.PluginError); }
    }
}).addBatch({
    'Plugin': {
        topic: new P.Plugin('path/to/test-plugin'),
        'has an ID': function(r) { assert.equal(r.id, 'test-plugin'); },
        'has a name': function(r) { assert.equal(r.name, 'test-plugin'); },
        'has a root': function(r) { assert.equal(r.root, 'path/to/test-plugin'); },

        // 'fires correct events on': {
        //     'load OK': firesEvents('load', { load: true, ready: true, error: false }),
        //     'load with thrown': {
        //         topic: function(r) { 
        //             r._load = function(cb) { 
        //                 throw new Error('thrown') 
        //             }; 
        //             return r; 
        //         },
        //         'error': firesEvents('load', { load: true, ready: false, error: false })
        //     },
        //     'load with callback': {
        //         topic: function(r) { 
        //             r._load = function(cb) { 
        //                 cb(new Error('callback'));
        //             }; 
        //             return r; 
        //         },
        //         'error': firesEvents('load', { load: true, ready: false, error: false })
        //     },
        // },
    }
}).export(module);
