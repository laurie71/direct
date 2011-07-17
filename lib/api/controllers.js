var lib = require('jslib');
var path = require('path');

// ------------------------------------------------------------------------
var controllers = module.exports = new (function controllers() {});
// ------------------------------------------------------------------------

controllers.ActionContext = ActionContext;
controllers.ActionReference = ActionReference;

// ------------------------------------------------------------------------

function ActionContext(req, res, next) {
    this.request = req;
    this.response = res;
    this.next = next;
    
    Object.freeze(this);
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
