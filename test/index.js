// var vows = require('vows');
// 
// function suites(module) {
//     var ss = [], exports = require(module);
//     for (var s in exports) {
//         // if (s instanceof vows.Suite) {
//             ss.push(s);
//         // }
//     }
//     return ss;
// }
// 
// vows.suites = vows.suites.concat(
//     [ suites('./i18n-locale-spec')
//     , suites('./i18n-message-set-spec')
//     ]
// );
// // vows.describe('Direct Web Framework').
// //  addBatch(require('./i18n-locale-spec')).
// //     addBatch(require('./i18n-message-set-spec')).
// //     export(module);
// //     // addBatch(require('./resources-spec')).
// //     // addBatch(require('./plugins-spec')).
// // 
// // // exports.plugins     = require('./test-plugins');
// // // exports.properties  = require('./test-properties');
// // // exports.resources   = require('./test-resources');
