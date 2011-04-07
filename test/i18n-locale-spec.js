var assert = require('assert');
var vows = require('vows');
var i18n = require('../lib/i18n');

var suite = vows.describe('i18n Locale').addBatch({
    'A fully-specified Locale': {
        topic: new i18n.Locale('lang', 'region', 'variant'),
        'has language': function(locale) { assert.equal(locale.language, 'lang'); },
        'has region':   function(locale) { assert.equal(locale.region, 'region'); },
        'has variant':  function(locale) { assert.equal(locale.variant, 'variant'); },
        'is memoized':  function(locale) {
            assert.strictEqual(new i18n.Locale('lang', 'region', 'variant'), locale);
            assert.strictEqual(i18n.Locale('lang', 'region', 'variant'), locale);
        },
        'maps its parent to the language/region locale': function(lrv) { 
            assert.strictEqual(lrv.parent(), i18n.Locale('lang', 'region')); 
        },
        'maps its grand-parent to the language locale': function(lrv) { 
            assert.strictEqual(lrv.parent().parent(), i18n.Locale('lang')); 
        },
        'maps its great-grand-parent to nothing': function(lrv) { 
            assert.isNull(lrv.parent().parent().parent()); 
        }
    },
    
    'Locales can be created with': {
        'language only, leaving': {
            topic: new i18n.Locale('lang'),
            'region undefined': function(locale) { assert.isUndefined(locale.region); },
            'variant is undefined': function(locale) { assert.isUndefined(locale.variant); },
        },
        'language/region only, leaving': {
            topic: new i18n.Locale('lang', 'region'),
            'variant is undefined': function(locale) { assert.isUndefined(locale.variant); }
        }
    },
    
    'The string representation of a': {
        'fully-specified Locale is "ll_RR_VVV"': function() { assert.equal(i18n.Locale('ll', 'RR', 'VVV').toString(), 'll_RR_VVV'); },
        'language/region Locale is "ll_RR"': function() { assert.equal(i18n.Locale('ll', 'RR').toString(), 'll_RR'); },
        'language-only Locale is "ll"': function() { assert.equal(i18n.Locale('ll').toString(), 'll'); }
    },
    
    'String representations are correctly parsed': {
        'll': function() { assert.equal(i18n.Locale.parse('ll'), i18n.Locale('ll')); },
        'll_RR': function() { assert.equal(i18n.Locale.parse('ll_RR'), i18n.Locale('ll', 'RR')); },
        'll-RR': function() { assert.equal(i18n.Locale.parse('ll-RR'), i18n.Locale('ll', 'RR')); },
        'll_RR_VVV': function() { assert.equal(i18n.Locale.parse('ll_RR_VVV'), i18n.Locale('ll', 'RR', 'VVV')); },
        'll_RR-VVV': function() { assert.equal(i18n.Locale.parse('ll_RR-VVV'), i18n.Locale('ll', 'RR', 'VVV')); },
        'll_RR-VVV-XXX': function() { 
            assert.equal(i18n.Locale.parse('ll_RR-VVV-XXX'), i18n.Locale('ll', 'RR', 'VVV-XXX')); 
        }
    }
}).export(module);