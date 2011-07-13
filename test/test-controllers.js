var assert = require('assert');
var vows = require('vows');

var C = require('../lib/api/controllers');

function toPath(path) {
    return function(c) { 
        console.dir(this);
        assert.equal(c.resolve('???'), path); 
    }
}

function assertResolvesTo(tests) {
    var ctx = {}, t, n;
    for (t in tests) {
        n = t + ' --> ' + tests[t];
        ctx[n] = (function() { 
            var input = t, 
                expect = tests[t];
                
            return function(c) {
                var app = c.app,
                    root = app.root,
                    resolve = c.resolve(input),
                    actual = resolve.slice(root.length+1);
                
                assert.equal(actual, expect); 
            };
        }());
    }
    return ctx;
}

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

                assert.equal(result.toString(), plugin+':'+controller+'.'+action);
                assert.equal(result.valueOf(), plugin+':'+controller+'.'+action);
            }
        }());
    }
    return ctx;
}

vows.describe('Direct Controllers').addBatch({
    'ActionContext': {
        topic: function() {
            var req = {}, res = {}, next = {},
                ctx = C.ActionContext(req, res, next);
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
    
// TODO:
// }).addBatch({
//     'ActionInvocation': {
    
}).addBatch({
    'ActionController': {
        // 'constructor': {
        //     'seals instances': function() {
        //         var ac = new C.ActionController({ root: 'R' })
        //         assert.ok(Object.isSealed(ac), 'should be sealed');
        //     },
        //     'immutably initializes context': function() {
        //         var ctx = {}, c = new C.ActionController(ctx);
        //         assert.strictEqual(c.context, ctx);
        //         c.context = false;
        //         assert.strictEqual(c.context, ctx);
        //     }
        // },
        
        // 'define()': {
        //     topic: function() { 
        //         var result = {},
        //             action = function() { result.this = this; result.args = arguments; },
        //             base = { index: action },
        //             ac = C.ActionController.define(base); 
        //             
        //         return { ac: ac, base: base, result: result };
        //     },
        //     
        //     'returns an ActionController constructor': function(t) {
        //         assert.isFunction(t.ac);
        //         assert.strictEqual(t.ac.prototype.__proto__, C.ActionController.prototype);
        //     },
        //     
        //     'includes actions on its prototype': function(t) {
        //         assert.ok(t.ac.prototype.hasOwnProperty('index'), 'has index action');
        //     },
        //     
        //     'but not methods/props from ActionController': function(t) {
        //         assert.ok(! t.ac.prototype.hasOwnProperty('request'), 'does not have request prop');
        //     },
        //     
        //     'and defines static invoke': function(t) {
        //         assert.isFunction(t.ac.invoke);
        //     },
        //     
        //     'which invokes actions with correct context': function(t) {
        //         var req = {}, res = {}, nxt = {};
        //         t.ac.invoke('index', req, res, nxt);
        //         
        //         assert.instanceOf(t.result.this, C.ActionController);
        //         assert.strictEqual(t.result.this.request, req);
        //         assert.strictEqual(t.result.this.response, res);
        //         assert.strictEqual(t.result.this.next, nxt);
        //         assert.length(t.result.args, 0);
        //         
        //         // make sure the proto-type's context isn't messed with!
        //         assert.isUndefined(t.ac.context);
        //     }
        // }
    }
}).addBatch({
    'Controller': {
        'constructor': {
            'initializes instances': function() {
                var app = {}, ctrl = new C.Controller(app);
                assert.strictEqual(ctrl.app, app);
            }
        },
        
        // 'instance': {
        //     topic: function() {
        //         var app = { root: __dirname+'/fixtures/test-app' };
        //         var ctrl = new C.Controller(app);
        //         return ctrl;
        //     },
        //     
        //     // 'resolves invalid'
        // 
        //     'resolves': assertResolvesTo(
        //         { 'application.index': 'app/controllers/application'
        //     
        //         // TODO: support for app/plugin prefixes:
        //         //
        //         // , 'app:application.index': 'app/controllers/application'
        //         // , 'local:local.index': 'app/plugins/local/app/controllers/local'
        //         // , 'global:global.index': '/.../direct/plugins/global/app/controllers/global'
        //         }
        //     ),
        // 
        //     // 'load()': {
        //     //     topic: function(c) { return c.load(c.resolve('application')); },
        //     // 
        //     //     'produces an ActionController': function(ac) {
        //     //         assert.instanceOf(ac, C.ActionController);
        //     //     },
        //     //     'which is sealed': function(ac) { assert.ok(Object.isSealed(ac)); },
        //     //     'and has controller actions': function(ac) {
        //     //         assert.isFunction(ac.__proto__.index)
        //     //     }
        //     // }
        // }
    }
}).export(module);
