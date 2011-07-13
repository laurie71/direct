// TODO: memoize resolve()

var _ = require('underscore');
var async = require('async');
var lib = require('jslib');
var path = require('path');

// ------------------------------------------------------------------------
var controllers = module.exports = new (function controllers() {});

controllers.ActionContext = ActionContext;
controllers.ActionReference = ActionReference;
controllers.ActionInvocation = ActionInvocation;
controllers.ActionController = ActionController;

// ------------------------------------------------------------------------

function ActionContext(req, res, next) {
    var ctx = { request: req, response: res, next: next }
    Object.freeze(ctx);
    return ctx;
}

// ------------------------------------------------------------------------

function ActionReference(action) {
    var ref = ActionReference.RE.exec(action);
    
    ref = ref && {
        plugin:     ref[1] || 'app',
        controller: ref[2],
        action:     ref[3]
    };
    
    if (! ref) throw new TypeError('invalid action reference: '+action);
    if (! ref.controller) throw new TypeError('invalid action reference (missing controller): '+action);
    if (! ref.action) throw new TypeError('invalid action reference (missing action): '+action);
    
    this.plugin = ref.plugin;
    this.controller = ref.controller;
    this.action = ref.action;
    
    Object.freeze(this);
}

ActionReference.RE = /^(?:([^:]*):)?([^\.]+)\.(.+)$/;

ActionReference.prototype.toString = function() { 
    return this.plugin +':' + this.controller + '.' + this.action;
}

ActionReference.prototype.valueOf = function() { 
    return this.toString();
}

// ------------------------------------------------------------------------

function ActionInvocation(context) {
    Object.defineProperty(this, 'context', {
        enumerable: true,
        value: context
    });
    // Object.seal(this);
};

ActionInvocation.define = function(base) {
    var ctor = lib.inherit(ActionInvocation, base);
    ctor.invoke = function(action, req, res, next) {
        var controller = new ctor(new ActionContext(req, res, next));
        // Object.freeze(controller);
// console.log('*** invoking '+action+' on '+controller.toString());        
// console.log('*** invoking '+action+' on '+controller);        
// console.log('*** invoking '+action+' on ');
// console.dir(controller)
        controller[action]();
    }
    return ctor;
}

ActionInvocation.prototype = Object.create(Object.prototype, {
    constructor: { value: ActionInvocation },
    
    // context needs to be defined on the instance not the prototype,
    // otherwise it can't be assigned after sealing the instance
    // context: { value: null, writeable: true },
    
    request:  { enumerable: true, get: function() { return this.context.request; }},
    response: { enumerable: true, get: function() { return this.context.response; }},
    
    flash:  { enumerable: true, get: function() { return this.request.flash; }},
    params: { enumerable: true, get: function() { return this.request.params; }},
    locals: { enumerable: true, get: function() { return this.request.locals; }},
    
    next:  { enumerable: true, get: function() { return this.context.next; }},
    write: { enumerable: true, get: function() { return this.response.write; }},
    end:   { enumerable: true, get: function() { return this.response.end; }},
    
    send: { enumerable: true, get: function() { return this.response.send; }},
    // send401Unauthorized: //{ get: function() { return this.response.send; }},
    // send403Forbidden: //{ get: function() { return this.response.send; }},
    // send404NotFound: //{ get: function() { return this.response.send; }},
    // send500Error: //{ get: function() { return this.response.send; }},
    
    // todo:
    // redirect: function(...) {} // smart plugin:controller.action-aware redirect
    // render: function(...) {} // smart render w/ controller<-->view mapping
    // partial: function(...) {} // smart render w/ controller<-->view mapping
});

ActionInvocation.prototype.toString = function foo() { return '[object ActionInvocation]'; }

// ------------------------------------------------------------------------

function ActionController(app, controller) {
    this.fullpath = path.join(app.root, 'app/controllers', controller);
    this.path = controller;
    
    this.actions = require(this.fullpath);
}

ActionController.prototype.invoke = function(action, req, res, next) {
    var ctx = new ActionContext(req, res, next),
        inv = new ActionInvocation(ctx);
        
    this.actions[action].call(inv);
}

ActionController.prototype.toString = function() {
    return '['+this.path+' ActionController]';
}

// ------------------------------------------------------------------------

controllers.Controller = lib.inherit(Object, {
    constructor: function Controller(app) {
        this.app = app;
    },
    
    resolve: function(action) {
        return new ActionController(this.app, action.controller);
    },
    // 
    // load: function(fullpath) {
    //     var c;
    //     
    //     // first, load the controller module
    //     try { 
    //         c = require(fullpath); 
    //     } catch (e) { 
    //         console.dir(e); // xxx
    //         throw new Error('Controller not found: '+fullpath);  // xxx
    //     }
    //     
    //     // make sure it's an object suitable to inherit from AC
    //     if (lib.typeOf(c) != 'object') {
    //         throw new Error('Controller module must export an object'); // xxx
    //     }
    // 
    //     // // freeze the controller module itself to guard against state
    //     // // leaking between requests, and turn it into an ActionInvocation
    //     // c = lib.inherit(ActionInvocation, c);
    //     // c = new c();
    //     // return c;
    //     return ActionInvocation.create(c);
    // }
});
