var assert = require('assert');
var vows = require('vows');

var U = require('../lib/api/util');
var R = require('../lib/api/resources');

var firesEvents = require('./lib').firesEvents;


vows.describe('Direct Resources').addBatch({
    'ResourceError': {
        topic: R.ResourceError('info str'),
        'isa Error': function(e) { assert.instanceOf(e, Error); },
        'isa DirectError': function(e) { assert.instanceOf(e, U.error.Error); },
        'isa ResourceError': function(e) { assert.instanceOf(e, R.ResourceError); }
    },
    'ResourceFileError': {
        topic: R.ResourceFileError('info str'),
        'isa Error': function(e) { assert.instanceOf(e, Error); },
        'isa DirectError': function(e) { assert.instanceOf(e, U.error.Error); },
        'isa ResourceError': function(e) { assert.instanceOf(e, R.ResourceError); },
        'isa ResourceFileError': function(e) { assert.instanceOf(e, R.ResourceFileError); }
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
            }
        }
    },
}).addBatch({    
    'ResourceFile': {
        topic: new R.ResourceFile('id', __dirname+'/fixtures/empty-resource.txt'),
        'has an ID': function(r) { assert.equal(r.id, 'id'); },
        'has a filename': function(r) { assert.isString(r.filename); },
        'fires correct events on': {
            'load OK': firesEvents('load', { load: true, ready: true, error: false }),
            'load with thrown': {
                topic: function(r) { 
                    r._load = function(cb) { 
                        throw new Error('thrown') 
                    }; 
                    return r; 
                },
                'error': firesEvents('load', { load: true, ready: false, error: false }, {
                    'error is wrapped': function(result) { 
                        assert.instanceOf(result.error, R.ResourceFileError);
                    }
                })
            },
            'load with callback': {
                topic: function(r) { 
                    r._load = function(cb) { 
                        cb(new Error('callback'));
                    }; 
                    return r; 
                },
                'error': firesEvents('load', { load: true, ready: false, error: false }, {
                    'error is wrapped': function(result) { 
                        assert.instanceOf(result.error, R.ResourceFileError);
                    }
                })
            }
        }
    }
}).export(module);
