var assert = require('assert');
var vows = require('vows');

var C = require('../lib/api/controllers');

function assertMapsTo(tests) {
    var ctx = {}, t;
    for (t in tests) {
        ctx[t] = (function() {
            var input = t, expect = tests[t];
            return function() {
                var result = new C.ActionReference(input),
                    plugin = expect[0] || 'app',
                    controller = expect[1],
                    action = expect[2];
                    
                assert.deepEqual(result, {
                    plugin:     plugin,
                    controller: controller,
                    action:     action
                });
            }
        }());
    }
    return ctx;
}

vows.describe('Direct Controllers').addBatch({
    'ActionContext': {
        topic: function() {
            var req = {}, res = {}, next = {},
                ctx = new C.ActionContext(req, res, next);
            return { ctx:ctx, req:req, res:res, next:next }
        },
        
        'initializes request':  function(t) { assert.strictEqual(t.ctx.request,  t.req)  },
        'initializes response': function(t) { assert.strictEqual(t.ctx.response, t.res)  },
        'initializes next':     function(t) { assert.strictEqual(t.ctx.next,     t.next) },
        
        'returns frozen object': function(t) { 
            assert.isObject(t.ctx);
            assert.ok(Object.isFrozen(t.ctx), 'should be frozen'); 
        }
    }
}).addBatch({
    'ActionReference': {
        'correctly maps': assertMapsTo({
            'foo:bar.baz': ['foo', 'bar', 'baz'],
                'bar.baz': ['app', 'bar', 'baz'],
        }),
        
        // TODO: 'reports error for': ...
        // [ 'foo:.baz', 'foo:bar', 'baz', '.baz' ]
    }
}).export(module);
