var assert = require('assert');
var vows = require('vows');
var props = require('direct/lib/properties');

var U = require('direct/lib/api/util');
var R = require('direct/lib/api/resources');
var P = require('direct/lib/properties');

function isError(fn) {
    return function() { assert.throws(fn, TypeError); }
};

function isBlank(ps) {
    return {
        topic: ps,
        'Properties object': function(ps) { assert.instanceOf(ps, props.Properties) },
        'marked <inline>': function(ps) { assert.equal(ps._filename, '<inline>'); },
        'with no values': function(ps) { assert.deepEqual(ps._data, {}); },
        'and parentless': function(ps) { assert.isNull(ps._parent); },
        'and not frozen': function(ps) { assert.equal(ps._frozen, false); }
    }
};

vows.describe('Direct Properties').addBatch({
    'PropertiesError': {
        topic: P.PropertiesError('info str'),
        'isa Error': function(e) { assert.instanceOf(e, Error); },
        'isa DirectError': function(e) { assert.instanceOf(e, U.error.Error); },
        'isa DirectFileError': function(e) { assert.instanceOf(e, U.error.FileError); },
        'isa ParseFileError': function(e) { assert.instanceOf(e, U.error.ParseFileError); },

        // XXX how is this passing? it shouldn't!!!
        'isa ResourceError': function(e) { assert.instanceOf(e, R.ResourceError); },
        // TODO: 'isa ResourceFileError': function(e) { assert.instanceOf(e, R.ResourceFileError); },
        
        'isa PropertiesError': function(e) { assert.instanceOf(e, P.PropertiesError); },
    }
// }).addBatch({
//     'Properties': {
//         topic: new P.Properties('test'),
//         // xxx 'has an ID': function(r) { assert.equal(r.id, 'test'); },
//     }
}).addBatch({
    'Properties Constructor': {
        'raises TypeError for': {
            'invalid values': isError(function() { new props.Properties({}, []); }),
            'invalid parent': isError(function() { new props.Properties({ parent: {} }); })
        },
        
        'with no': {
            'arguments': isBlank(new props.Properties()),
            'values': isBlank(new props.Properties({}, {}))
        },
        
        'initialized options correctly:': {
            'filename': function() {
                var ps = new props.Properties({ filename: 'f' });
                assert.equal(ps._filename, 'f');
            },
            'parent': function() {
                var p1 = new props.Properties({}, { p:true }),
                    p2 = new props.Properties({ parent: p1 });
                assert.strictEqual(p2._parent, p1);
            },
            'frozen': function() {
                var p1 = new props.Properties({ frozen: true });
                assert.equal(p1._frozen, true);
                assert.throws(function() { p1.set('x', true), EvalError});
                assert.isUndefined(p1.get('x'));
            }
        },
        
        'with values': {
            topic: function() { 
                var vs = { a: 1, b: 2, c: { d: 2 }};
                return { vs: vs, ps: new props.Properties({}, vs) };
            },
            
            'clones values recursively': function(t) { 
                assert.deepEqual(t.ps._data, t.vs); 
                assert.notStrictEqual(t.ps._data, t.vs);
                assert.notStrictEqual(t.ps._data.c, t.vs.c);
            }
        }
    }
}).addBatch({
    'Properties object supports': {
        topic: function() {
            var t = {};
            t.pvs = { p1: 1, p2: 1, p3: { a: 'a' }};
            t.cvs = { c1: 2, p2: 2, p3: { b: 'b' }};
            t.pps = new props.Properties({ filename: 'parent' }, t.pvs );
            t.cps = new props.Properties({ filename: 'child', parent: t.pps }, t.cvs );
            return t;
        },
        
        'get() of': {
            'undefinded keys': function(t) {
                assert.isUndefined(t.cps.get('missing'));
            },
            'keys defined in child': function(t) {
                assert.equal(t.cps.get('c1'), 2);
                assert.equal(t.cps.get('p2'), 2);
                assert.equal(t.cps.get('p3').b, 'b');
                assert.isUndefined(t.cps.get('p3').a); // should be hidden
            },
            'non-masked keys from parent': function(t) {
                assert.equal(t.cps.get('p1'), 1);
            }
        },
    
        'set() of': {
            topic: function(t) { 
                return {
                    p1: t.pps, 
                    c1: t.cps, 
                    c2: new props.Properties({ parent: t.cps }, { c2: null })
                };
            },
        
            'undefined keys': function(t) {
                t.c2.set('not frozen', true); 
                assert.isTrue(t.c2.get('not frozen'));
                assert.isUndefined(t.c1.get('not frozen'));
                assert.isUndefined(t.p1.get('not frozen'));
            },
            'keys defined in child': function(t) {
                t.c2.set('c2', 1); 
                assert.equal(t.c2.get('c2'), 1);
                assert.isUndefined(t.c1.get('c2'));
                assert.isUndefined(t.p1.get('c2'));
            },
            'keys from parent(s)': function(t) {
                t.c2.set('p2', 3);
                assert.equal(t.c2.get('p2'), 3);
                assert.equal(t.c1.get('p2'), 2);
                assert.equal(t.p1.get('p2'), 1);
            }
        }
    }
}).addBatch({
    'Parsing properties': {
        'raises TypeError for': {
            'missing data arg': isError(function() { props.Properties.parse(null); })
        },
        
        'raises PropertiesError for': {
            'key with missing value': function() {
                assert.throws(
                    function() { props.Properties.parse('key w/out value'); },
                    props.ParsePropertiesError
                );
            },
            'value with missing key': function() {
                var p;
                assert.throws(
                    function() { props.Properties.parse('= value w/out key'); },
                    props.ParsePropertiesError
                );

            }
        },
        
        'with no': {
            'data': function() { 
                assert.deepEqual(props.Properties.parse(
                    '  \n  \n'), {}); 
            },
            'non-whitespace data': function() { 
                assert.deepEqual(props.Properties.parse(
                    '  \n  \n'), {}); 
            },
            'non-comment data': function() {
                assert.deepEqual(props.Properties.parse(
                    '// this is a comment\n  // so is this'), {});
            }
        },
        
        'with valid data': {
            topic: props.Properties.parse(
                [ '// header comment'
                , 'compact=compact value'
                , '  spaced  =  spaced value  '
                , 'repeated =  value 1'
                , 'repeated =  value 2'
                , 'embedded = value1 = value2'
                , 'continued 1 =  continued \\\n  value'
                , 'continued 2 =  continued \\\n  value\\\n2  '
                , 'unterminated = no EOL'
                ].join('\n')
            ),
            
            'gets complete keys and values': function(ps) {
                assert.equal(ps['compact'], 'compact value');
            },
            'fully trims keys and values': function(ps) {
                assert.equal(ps['spaced'], 'spaced value');
            },
            'overrides repeated values': function(ps) {
                assert.equal(ps['repeated'], 'value 2');
            },
            'ignores embedded separators': function(ps) {
                assert.equal(ps['embedded'], 'value1 = value2');
            },
            'handles continuations': function(ps) {
                assert.equal(ps['continued 1'], 'continued value');
                assert.equal(ps['continued 2'], 'continued value 2');
            },
            'accepts missing EOL on final line': function(ps) {
                assert.equal(ps['unterminated'], 'no EOL');
            }
        }
    }
}).addBatch({
    'Loading properties files': {
        'without a filename throws': function() {
            assert.throws(function() {
                props.Properties.load({}, this.callback);
            }, TypeError);
        }
    }
}).export(module);