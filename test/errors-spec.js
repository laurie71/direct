var assert = require('assert');
var path = require('path');
var vows = require('vows');

var error = require('../lib/errors');

var DE = error.DirectError;


var suite = vows.describe('direct.framework.error').addBatch({
    'An error': {
        "constructed with only a message": {
            topic: DE('test message'),
            // topic: new DE('test message'),
            'has an ID': function(e) { assert.isString(e.id); },
            'has a name': function(e) { assert.equal(e.name, 'DirectError'); },
            'has a message': function(e) { assert.equal(e.message, 'test message'); },
            'has a stack trace': function(e) { 
                var stack = e.stack, lines;
                
                assert.isString(stack);

                lines = stack.split('\n');
                assert.include(lines[0], 'DirectError: test message');
                assert.include(lines[1], '/errors-spec.js');
            }
        },
        "constructed with options": {
            topic: function() {
                var msg = 'opts error',
                    opts = {
                        id: 'ignored',
                        name: 'OptsError',
                        cause: new Error('root error'),
                        extended: 'extended option'
                    };
                    
                return { msg: msg, opts: opts, err: new DE(msg, opts) };
            },
            'has an assigned ID': function(api) { assert.notEqual(api.err.id, 'ignored'); },
            'has the specified name': function(api) { assert.strictEqual(api.err.name, api.opts.name); },
            'has the specified cause': function(api) { assert.strictEqual(api.err.cause, api.opts.cause); },
            'has other specified props': function(api) { assert.strictEqual(api.err.extended, api.opts.extended); }
        }
    }
}).export(module);
