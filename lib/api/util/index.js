// ------------------------------------------------------------------------
var util = module.exports = new (function util() {});
// ------------------------------------------------------------------------

util.error = require('./error');
util.logging = require('./logging');
util.log = util.logging.Logger();
