var Emitter = require('events').EventEmitter;
// var log = require('util').debug;
var log = console.log;

var debug = require('util').debug;

function mixin(target) {
    for (var i = 1; i < arguments.length; i++) {
        var src = arguments[i];
        Object.getOwnPropertyNames(src).forEach(function(key) {
            prop = Object.getOwnPropertyDescriptor(src, key);
            Object.defineProperty(target, key, prop);
        });
    }
}

function Token(type, image, line, start, span) {
    return {
        type:  type,
        image: image,
        line:  line,
        start: start,
        span:  span
    }
}

Token.types = {};
Token.types.TEXT = 'text';
Token.types.EXPR_PFX = 'pexpr';
Token.types.EXPR_IFX = 'iexpr';

function Text(image, line, start, span) {
    var t = Token(Token.types.TEXT, image, line, start, span);
    return t;
}

function ExprPfx(op, expr, image, line, start, span) {
    var t = Token(Token.types.EXPR_PFX, image, line, start, span);
    t.op = op; t.expr = expr; 
    return t;
}

function ExprIfx(op, expr, image, line, start, span) {
    var t = Token(Token.types.EXPR_IFX, image, line, start, span);
    t.op = op; t.expr = expr; 
    return t;
}


function Scanner(options) {
    var scanner = new Emitter(),
        options = options || {},
        source = '', buf = '',
        last = { line: 0, index: 0, offset: 0 },
        head = { line: 0, index: 0, offset: 0 }, 
        state = [[Token.types.TEXT]];
        
    options.operators = options.operators || { '$':'$' };
    
    function _reset() {
        last = { line: 0, offset: 0, index: 0 },
        head = { line: 0, offset: 0, index: 0 }, 
        buf = '';
    }
    
    function _resetLast() {
        last.line = head.line; 
        last.index = head.index;        
        last.offset = head.offset; 
    }
    
    function _text() {
        scanner.emit('token', Text(buf, 
            last.line, last.index, 
            head.offset - last.offset));
            
        buf = '';
        _resetLast();
    }
    
    function _pexpr() {
        var s = state.pop(),
            op, expr, image, tok;
            
        op = s[1];
        expr = s.slice(3, -1).join('');
        image = s.slice(1).join('');
        
        scanner.emit('token', ExprPfx(op, expr, image,
            last.line, last.index, head.offset - last.offset));
            
        buf = '';
        _resetLast();
    }
    
    function _iexpr() {
        var s = state.pop(),
            op, expr, image, tok;

log('EXPR '+JSON.stringify(s));            
        op = s[2];
        expr = s.slice(3, -1).join('');
        image = s.slice(1).join('');
        
        scanner.emit('token', ExprIfx(op, expr, image,
            last.line, last.index, head.offset - last.offset));
            
        buf = '';
        _resetLast();
    }
    
    function next() {
        var ch = source[head.offset++];
        
        if (ch === '\n') {
            head.line++;
            head.index = 0;
        } else {
            head.index++;
        }
        
        return ch;
    }
    
    function badeof(msg) {
        scanner.emit('error', 'unexpected end of input: '+msg);
        scanner.emit('end');
    }
    
    function advance(ateof) {
        var la, la2, esc, s,
            ops = options.operators;
        
        function escape() {
            if (la === '\\') {
                if (la2) {
                    buf += next(); // '\'
                    buf += next(); // any
                    return true;
                } else if (ateof) {
                    badeof('unterminated escape');
                }
                return undefined;
            }
            return false;
        }
        
        while (head.offset < source.length) {
            s = state.slice(-1)[0];
            la = source[head.offset];
            la2 = source[head.offset+1];
log('%j la <%s> la2 <%s> buf [%s]', head,la,la2,buf);

            switch (s[0]) {
            case Token.types.TEXT:
                if ((esc = escape()) === undefined) {
                    return; // waiting for input
                }
                if (! esc) {
                    if (la in ops) {
                        // prefix-expr?
                        if (! la2) {
                            if (ateof && buf) _text();
                            return;
                        }
                        if (la2 === '{') {
                            // matched
                            if (buf) _text(); // emit, reset buf, pop state
                            state.push([Token.types.EXPR_PFX, next(), next()]); // op, '{'
                        } else {
                            // no; la is a plain char
                            buf += next();
                        }
                    } else if (la === '{') {
                        // infix-expr?
                        if (! la2) {
                            if (ateof && buf) _text();
                            return; 
                        }
                        if (la2 === '{') {
                            // matched
                            if (buf) _text(); // emit, reset buf, pop state
                            state.push([Token.types.EXPR_IFX, next() + next()]); // '{{'
                        } else {
                            // no; la is a plain {
                            buf += next(); 
                        }
                    } else {
                        buf += next();
                    }
                }
                break;
            case Token.types.EXPR_PFX:
                // TODO: check for quoting level, tonkenize expr, etc
                // saw op, '{'; scanning for '}'
                if ((esc = escape()) === undefined) {
                    return;
                }
                if (! esc) {
                    if (la === '}') {
                        // end of expr
                        if (buf) s.push(buf); // remainder of expr
                        s.push(next()); // '}'
                        _pexpr(); // emit, reset buf, pop state
                    } else {
                        buf += next();
                    }   
                }
                break;
            case Token.types.EXPR_IFX:
                if (s.length === 2) {
                    // saw '{{'; expect op or ident
                    if (la in ops) {
                        // ok: op
                        s.push(next());
                    } else if ((buf ? /[$_a-z0-9]/i : /[$_a-z]/i).test(la)) {
                        // ok: ident char
                        buf += next();
                    } else {
                        if (! buf) {
                            // error: non-ident char
                            scanner.emit('error', 
                                'unexpected character: "'+la+'"'+
                                ' (expected: identifier or '+JSON.stringify(Object.keys(ops))+')'
                            );
                            // push empty ident so scanner can recover on next loop
                            s.push('');
                        } else {
                            // push ident
                            s.push(buf);
                            buf = '';
                        }
                    }
                } else {
                    // saw '{{', op or ident; scanning for '}}'
                    if ((esc = escape()) === undefined) {
                        return;
                    }
                    if (! esc) {
                        // TODO: check for quoting level, tonkenize expr, etc
                        if (la === '}') {
                            if (! la2) {
                                if (ateof) {
                                    badeof('unterminated expression (expected "}}")');
                                }
                                return;
                            }
                            if (la2 === '}') {
                                // end of expr
                                if (buf) s.push(buf); // remainder of expr
                                s.push(next() + next()); // '}}'
                                _iexpr(); // emit, reset buf, pop state
                            } else {
                                buf += next();
                            }
                        } else {
                            buf += next();
                        }
                    }
                }
                break;
            default:
                scanner.emit('error', 'unknown scanner state: '+JSON.stringify(s));
            }
        }
        
        if (ateof && head.offset >= source.length) {
            if (s) {
                switch (s[0]) {
                case Token.types.TEXT:
                    if (buf || !source) _text();
                    break;
                case Token.types.EXPR_PFX:
                    badeof('unterminated expression (expected "}")');
                    break;
                case Token.types.EXPR_IFX:
                    badeof('unterminated expression (expected "}}")');
                    break;
                }
            }
        }
    }
    
    scanner.write = function write(data) {
        if (typeof(data) !== 'string') {
            scanner.emit('error', 'invalid input (not string data)');
        }
        if (data) {
            source += data;
            advance();
        }
    }
    
    scanner.end = function end() {
        advance(true); // TODO: make advance error if unexpected end-of-input
        _reset();
        scanner.emit('end');
    }
    
    return scanner;
}


// ========================================================================
// TMP TEST HARNESS
// ========================================================================

var tests = {
    'text':         [{"type":"text","image":"text","line":0,"start":0,"span":4}],
//x    // '\\text':       [{"type":"text","image":"\\text","line":0,"start":0,"span":5}],
//x    // '{text}':       [{"type":"text","image":"{text}","line":0,"start":0,"span":6}],
    // '{{text}}':     [{"type":"iexpr","image":"{{text}}","line":0,"start":0,"span":8, "op":"text", "expr":""}],
    // '{{text}}':     [{"type":"iexpr","image":"{{text}}","line":0,"start":0,"span":8, "op":"text","expr":""}],
    // '${text}':      [{"type":"pexpr","image":"${text}","line":0,"start":0,"span":7, "op":"$","expr":"text"}],
    // 'x{{text}}x':   [{"type":"text", "image":"x",       "line":0,"start":0,"span":1}
    //                 ,{"type":"iexpr","image":"{{text}}","line":0,"start":1,"span":8, "op":"text", "expr":""}
    //                 ,{"type":"text", "image":"x",       "line":0,"start":9,"span":1}
    //                 ]
};

var assert = require('assert');
Object.keys(tests).forEach(function(input) {
    var scanner = new Scanner(),
        tokens = [],
        tok;
        
    scanner.on('error', function(err) {
        throw err;
    });
    scanner.on('token', function(tok) { 
        log('token: %j', tok);
        tokens.push(tok); 
    });
    scanner.on('end', function() {
log('EXPECT: '+JSON.stringify(tests[input]));
log('ACTUAL: '+JSON.stringify(tokens));
        assert.deepEqual(tokens, tests[input]);
        log('PASS');
    });
    
    scanner.write(input);
    scanner.end();
});