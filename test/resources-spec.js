var assert = require('assert');
var vows = require('vows');

var U = require('direct/lib/api/util');
var R = require('direct/lib/api/resources');

var firesEvents = require('./lib').firesEvents;

// console.log(U);
// console.log(U.error);
// console.log(U.error.Error);
// console.log(U.error.Error('xxx'));
// console.log(U.error.Error('xxx') instanceof Error);
// console.log(U.error.Error('xxx') instanceof U.error.Error);
console.log(R.ResourceError('xxx') instanceof U.error.Error);
console.log(R.ResourceError('xxx') instanceof R.ResourceError); // xxx


vows.describe('Direct Resources').addBatch({
    'ResourceError': {
        topic: R.ResourceError('info str'),
        'isa Error': function(e) { assert.instanceOf(e, Error); },
        'isa DirectError': function(e) { assert.instanceOf(e, U.error.Error); },
        'isa ResourceError': function(e) { assert.instanceOf(e, R.ResourceError); }
    }
}).addBatch({
    'Resource': {
        topic: new R.Resource('test'),
        'has an ID': function(r) { assert.equal(r.id, 'test'); },
        'fires correct events on': {
            'load OK': firesEvents('load', { load: true, ready: true, error: false }),
            'load with thrown': {
                topic: function(r) { 
                    r._load = function(cb) { 
                        throw new Error('thrown') 
                    }; 
                    return r; 
                },
                'error': firesEvents('load', { load: true, ready: false, error: false })
            },
            'load with callback': {
                topic: function(r) { 
                    r._load = function(cb) { 
                        cb(new Error('callback'));
                    }; 
                    return r; 
                },
                'error': firesEvents('load', { load: true, ready: false, error: false })
            },
        }
    }
}).export(module);
