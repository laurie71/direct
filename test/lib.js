var assert = require('assert');

exports.firesEvents = function firesEvents(fn, es) {
    var ctx = {
        topic: function(emitter) {
            var cb = this.callback, fired = {};
            Object.keys(es).map(function(event) { 
                fired[event] = false; 
                emitter.on(event, function() { fired[event] = true; });
            });
            emitter[fn](function(e) {
                cb(null, {
                    error: e,
                    events: fired,
                    expected: es,
                    callback: arguments
                });
            });
        }
    }
    Object.keys(es).forEach(function(event) {
        var label = event + ' (' + (es[event] ? 'fired' : 'not fired') + ')';
        ctx[label] = function(result) { assert.ok(result.events[event] === result.expected[event]); }
    });
    return ctx;
}
