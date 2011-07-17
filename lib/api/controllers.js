var lib = require('jslib');
var path = require('path');

// ------------------------------------------------------------------------
var controllers = module.exports = new (function controllers() {});
// ------------------------------------------------------------------------

controllers.ActionContext = ActionContext;
controllers.ActionReference = ActionReference;
controllers.ActionController = ActionController;

// ------------------------------------------------------------------------

function ActionContext(req, res, next) {
    this.request = req;
    this.response = res;
    this.next = next;
    
    Object.freeze(this);
}

ActionContext.prototype.toString = function() {
    return '[object ActionContext]';
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
    return (
        '[' +
        this.plugin + ':' + this.controller + '.' + this.action +
        ' ActionReference' +
        ']'
    );
}

ActionReference.prototype.valueOf = function() { 
    return this.toString();
}

// ------------------------------------------------------------------------

function ActionController(context) {
    Object.defineProperty(this, 'context', {
        enumerable: true,
        value: context
    });
    // Object.seal(this);
};

ActionController.prototype = Object.create(Object.prototype, {
    constructor: { value: ActionController },
    
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

ActionController.prototype.toString = function foo() { return '[object ActionController]'; }


// ------------------------------------------------------------------------
