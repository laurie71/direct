var vows = require('vows');

vows.describe('Direct Web Framework').
    addBatch(require('./test-resources')).
    addBatch(require('./test-properties')).
    addBatch(require('./test-routes')).
    addBatch(require('./test-plugins')).
    export(module);

// exports.plugins     = require('./test-plugins');
// exports.properties  = require('./test-properties');
// exports.resources   = require('./test-resources');
