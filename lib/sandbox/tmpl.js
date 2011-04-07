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

function Token(type, image) {
    if (! (this instanceof Token)) {
        return new Token(type, image);
    }
    this.type = type;
    this.image = image;
    Object.freeze(this);
}

Token.prototype.toString = function() {
    return this.type + '(' + this.image + ')';
}


function Lexer(src) {
    this.source = src || '';
    this.cursor = 0;
    this.state = [''];
    this.ops = ['$'];
}


mixin(Lexer.prototype, {
    get next() {
        var s = this.state,
            o = this.ops,
            tok = '';
            
        function push(state) { debug('> '+state); s.push(state); }
        function peek() { return s.slice(-1)[0]; }
        function pop() { debug('< '+peek()); return s.pop(state); }

        while (this.cursor < this.source.length) {
            var ch = this.source[this.cursor++],
                state = this.state.slice(-1)[0];
            
            switch (state) {
                case '': 
                    if (ch == '\\' || ch == '{' || o.indexOf(ch) >= 0) {
                        push(ch);
                    } else {
                        tok += ch;
                    }
                    break;
                case '\\':
                    pop();
                    tok += ch;
                    break;
                case '{':
                    switch (ch) {
                        case '{':
                            pop();
                            push('{{');
                            if (tok) return Token('', tok);
                            break
                        default:
                            tok += pop();
                            tok += ch;
                    }
                    break;
                case '{{':
                    switch (ch) {
                        case '}':
                            push('}');
                            break;
                        default:
                            tok += ch;
                    }
                    break;
                case '}':
                    switch (ch) {
                        case '}':
                            pop(); pop();
                            return Token('expr', tok);
                        default:
                            tok += pop();
                            tok += ch;
                    }
                    break;
                default:
                    var last = peek();
                    if (o.indexOf(last[0]) >= 0) {
                        if (last.length == 1) {
                            if (ch == '{') {
                                push(pop() + ch);
                            } else {
                                tok += pop();
                                tok += ch;
                            }
                        } else {
                            if (ch == '}') {
                                return Token(last[0], tok);
                            } else {
                                tok += ch;
                            }
                        }
                    } else {
                        throw new Error('invalid lexer state: '+state);
                    }
            }
        }
        
        return tok ? Token('', tok) : null;
    }
});

var tests = {
    'text': ['(text)'],
    '\\text': ['(text)'],
    '{text}': ['({text})'],
    '{{text}}': ['expr(text)'],
    '${text}': ['$(text)'],
    'x{{text}}x': ['(x)','expr(text)','(x)']
};

var assert = require('assert');
Object.keys(tests).forEach(function(input) {
    var lexer = new Lexer(input),
        tokens = [],
        tok;
    
    while (tok = lexer.next) {
        tokens.push(tok);
    }
    
    tokens = tokens.map(function(t) { return t.toString() });
    
    assert.deepEqual(tokens, tests[input]);
});