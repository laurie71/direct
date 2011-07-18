var lib = require('jslib');

// ------------------------------------------------------------------------
var logging = module.exports = new (function logging() {});
// ------------------------------------------------------------------------

var slice = Array.prototype.slice;
var levels = ['EMERGENCY', 'ALERT', 'CRITICAL', 'ERROR', 'WARNING', 'NOTICE', 'INFO', 'DEBUG'];
// var colors = []; // todo

// ------------------------------------------------------------------------

logging.Logger = function Logger(options) {
    if (! (this instanceof logging.Logger)) {
        return new logging.Logger(options);
    }
    options = options || {};
    this.level = options.level || 'DEBUG';
    this.stream = options.stream || process.stdout;
    // this.colorize = options.colorize || istty(this.stream);
}

// ------------------------------------------------------------------------

levels.forEach(function(label, index) {
    var level = logLevel(label, index);
    logging.Logger.prototype[label] = level;
    logging.Logger.prototype[label.toLowerCase()] = function() {
        log.call(this, level, slice.call(arguments));
    }
});

function logLevel(label, ordinal) {
    return {
        toString: function() { return label; },
        valueOf: function() { return ordinal; }
    };
};

function log(level, msgs) {
   if (level > this.level) return;
    this.stream.write(
        '[' + new Date().toUTCString() + '] ' +
        '(' + level.toString() + ') ' +
        msgs.join(' ') + '\n'
    );
}

// ------------------------------------------------------------------------
