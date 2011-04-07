var assert = require('assert');
var vows = require('vows');
var i18n = require('../lib/i18n');

var suite = vows.describe('i18n.MessageSet').addBatch({
    // 'When parsing': {
    //     topic: new i18n.MessageSet(),
    //     'blanks/comments are skipped': function(ms) {
    //         assert.deepEqual(ms._parse('<stdin>', ''), {});
    //         assert.deepEqual(ms._parse('<stdin>', ' '), {});
    //         assert.deepEqual(ms._parse('<stdin>', '\t'), {});
    //         assert.deepEqual(ms._parse('<stdin>', '\n'), {});
    //         assert.deepEqual(ms._parse('<stdin>', ' \n'), {});
    //         
    //         assert.deepEqual(ms._parse('<stdin>', '#'), {});
    //         assert.deepEqual(ms._parse('<stdin>', '# xxx'), {});
    //         assert.deepEqual(ms._parse('<stdin>', '# xxx\n'), {});
    //         
    //         assert.deepEqual(ms._parse('<stdin>', ' #'), {});
    //         assert.deepEqual(ms._parse('<stdin>', ' # xxx'), {});
    //         assert.deepEqual(ms._parse('<stdin>', ' # xxx\n'), {});
    //         
    //         assert.deepEqual(
    //             ms._parse('<stdin>', 
    //                 ('   \n'
    //                 +'# comment in col 0\n'
    //                 +'  # comment in col 2\r'
    //                 +'  # comment following CR\n\r'
    //                 +'  # comment following NL-CR\n\r'
    //                 +'  # comment following CR-ML\r\n'
    //                 +'  # another comment following CR-ML\r\n'
    //                 )
    //             ), 
    //             {});
    //     },
    //     'lines with no "=" throw error': function(ms) {
    //         var e;
    //         
    //         try { ms._parse('dummy', 'no separator'); }
    //         catch (err) { e = err; }
    //         
    //         assert.isObject(e, 'expected MessageError');
    //         assert.instanceOf(e, i18n.MessageError);
    //         assert.include(e.message, 'missing "="');
    //         assert.equal(e.sourceFile, 'dummy');
    //         assert.equal(e.sourceLine, 0);
    //         assert.equal(e.sourceColumn, 0);
    //     },
    //     'lines with no key throw error': function(ms) {
    //         var e; 
    //         
    //         try { ms._parse('dummy', '\n=no key'); }
    //         catch (err) { e = err; }
    //         
    //         assert.instanceOf(e, i18n.MessageError);
    //         assert.include(e.message, 'no key before "="');
    //         assert.equal(e.sourceFile, 'dummy');
    //         assert.equal(e.sourceLine, 1);
    //         assert.equal(e.sourceColumn, 0);
    //     },
    //     'lines with no message throw error': function(ms) {
    //         var e; 
    //         
    //         try { ms._parse('dummy', '\nno message='); }
    //         catch (err) { e = err; }
    // 
    //         assert.instanceOf(e, i18n.MessageError);
    //         assert.include(e.message, 'no message following "="');
    //         assert.equal(e.sourceFile, 'dummy');
    //         assert.equal(e.sourceLine, 1);
    //         assert.equal(e.sourceColumn, 11);
    //     },
    //     'duplicate keys throw error': function(ms) {
    //         var e; 
    //         
    //         try { ms._parse('dummy', 'key=value1\nkey=value2'); } 
    //         catch (err) { e = err; }
    // 
    //         assert.instanceOf(e, i18n.MessageError);
    //         assert.include(e.message, 'duplicate key "key"');
    //         assert.equal(e.sourceFile, 'dummy');
    //         assert.equal(e.sourceLine, 1);
    //         assert.equal(e.sourceColumn, 0);
    //     },
    //     'single valid line results in single entry': function(ms) {
    //         assert.deepEqual(ms._parse('<stdin>', 'key1=value1'), { key1: 'value1' });
    //         assert.deepEqual(ms._parse('<stdin>', ' key1 = value1 '), { key1: 'value1' });
    //     },
    //     'multiple valid lines results in multiple entries': function(ms) {
    //         assert.deepEqual(ms._parse('<stdin>', 'key1=value1\nkey2=value2'), 
    //             { key1: 'value1', 'key2': 'value2' });
    //     }
    // },
    
    'When looking up messages': {
        topic: function()  {
            var root = new i18n.MessageSet({}, null),
                lang = new i18n.MessageSet({}, new i18n.Locale('ll'), root),
                region = new i18n.MessageSet({}, new i18n.Locale('ll', 'RR'), lang),
                variant = new i18n.MessageSet({}, new i18n.Locale('ll', 'RR', 'VVV'), region),
                bundle = {
                    '': root,
                    'll': lang,
                    'll_RR': region,
                    'll_RR_VVV': variant
                };
            
            root._messages = { 'root': 'root.value' };
            lang._messages = { 'lang': 'lang.value' };
            region._messages = { 'region': 'region.value' };
            variant._messages = { 'variant': 'variant.value' };
            
            return bundle;
        },
        'locale definitions resolve directly': function(bundle) {
            assert.equal(bundle[''].get('root'), 'root.value');
        },
        'non-locale definitions resolve upwards': function(bundle) {
            var set = bundle['ll_RR_VVV'];
            assert.equal(set.get('variant'), 'variant.value');
            assert.equal(set.get('region'), 'region.value');
            assert.equal(set.get('lang'), 'lang.value');
            assert.equal(set.get('root'), 'root.value');
        },
        'undefined keys return key as fallback': function(bundle) {
            assert.equal(bundle['ll_RR_VVV'].get('missing.key'), 'missing.key');
        }
    },
    
    // 'When formatting messages': {
    //     
    // }
}).export(module);