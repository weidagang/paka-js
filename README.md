paka.js 
=======

Paka.js is a higher-order function based parser combinator. It's designed for creating language parsers in JavaScript. Unlike parser generators such as ANTLR, there's no static code generation involved. When writing language parsers in JavaScript, you can define the language grammar and semantics actions with the embedded DSL of paka.js. It is much light-weighted than parser generators.

### Examples ###

#### 1. Caculator ####

The following code implements a working caculator in less than 100 lines of code. The hightlight is that the language grammar is written in the embedded DSL, it's clean and easy to maintain.

```javascript
var paka = require('paka');

function calculate(src) {
    var NUM = paka.NUM;
    var EOF = paka.EOF;
    var CONCAT = paka.CONCAT;
    var OR = paka.OR;
    var LIST = paka.LIST;
    var $ = paka.$;

    var grammar = {
        'Arithmetic' : CONCAT($('Expr'), EOF),
        'Expr' : LIST($('Term'), $('TermOp'), true),
        'Term' : LIST($('Factor'), $('FactorOp'), true),
        'TermOp' : OR('+', '-'),
        'Factor' : OR($('P-Expr'), $('Num')),
        'FactorOp' : OR('*', '/'),
        'P-Expr' : CONCAT('(', $('Expr'), ')'),
        'Num' : NUM()
    };

    var actions = {
        'Num' : function(r) { r.extra = parseFloat(r.text()); },
        'Factor' : function(r) { r.extra = r.children[0].extra; },
        'Term' : function(r) { 
            r.extra = r.children[0].extra;
            for (var i = 1; i < r.children.length; i += 2) {
                var factor_op = r.children[i];
                var factor = r.children[i+1];
                if ('*' == factor_op.text()) {
                    r.extra *= factor.extra;
                }
                else if ('/' == factor_op.text()) {
                    r.extra /= factor.extra;
                }
            }
        },
        'Expr' : function(r) {
            r.extra = r.children[0].extra;
            for (var i = 1; i < r.children.length; i += 2) {
                var factor_op = r.children[i];        
                var factor = r.children[i+1];
                if ('+' == factor_op.text()) {
                    r.extra += factor.extra;
                }
                else if ('-' == factor_op.text()) {
                    r.extra -= factor.extra;
                }
            }
        },
        'P-Expr' : function(r) { r.extra = r.children[1].extra; },
        'Arithmetic' : function(r) { r.extra = r.children[0].extra; }
    }

    var parser = paka.create(grammar, actions);
    var ast = parser.parse('Arithmetic', src);

    if (paka.S.OK == ast.status) {
        console.log(src + ' = ' + ast.extra);
    }
    else {
        console.error('Invalid expression');
    }
}
```

#### 2. JSON Parser ####

The following code implements a JSON parser which creates a JSON object from its string representation. Reference: [http://www.json.org/fatfree.html](http://www.json.org/fatfree.html)

```javascript
function parse(src) {
    var NUM = paka.NUM;
    var EOF = paka.EOF;
    var CONCAT = paka.CONCAT;
    var OR = paka.OR;
    var REPEAT = paka.REPEAT;
    var OPT = paka.OPT;
    var DQ_STR = paka.DQ_STR;
    var ENCLOSED_LIST = paka.ENCLOSED_LIST;
    var $ = paka.$;
    
    var grammar = {
        'JSON' : CONCAT($('Value'), EOF),
        'Value' : OR($('Num'), $('Null'), $('Bool'), $('String'), $('Object'), $('Array')),
        'Object' : ENCLOSED_LIST('{', $('KeyValuePair'), ',', '}'),
        'KeyValuePair' : CONCAT($('Key'), ':', $('Value')),
        'Key' : $('String'),
        'Num' : NUM(),
        'Null' : 'null',
        'Bool' : OR('false', 'true'),
        'String' : DQ_STR(),
        'Array' : ENCLOSED_LIST('[', $('Value'), ',', ']')
    };

    var actions = {
        'Num' : function(r) { r.extra = parseFloat(r.text()); },
        'Null' : function(r) { r.extra = null },
        'Bool' : function(r) { r.extra = ('true' == r.text()); },
        'String' : function(r) { r.extra = escape_str(r.text()); },
        'Key' : function(r) { },
        'Value' : function(r) { r.extra = r.children[0].extra; },
        'KeyValuePair' : function(r) { r.extra = { key : r.children[0].extra, value : r.children[2].extra }; },
        'Object' : function(r) { 
            r.extra = {};
            for (var i = 0; null != r.children && i < r.children.length; ++i) {
                r.extra[r.children[i].extra.key] = r.children[i].extra.value;
            }
        },
        'Array' : function(r) {
            r.extra = [];
            for (var i = 0; null != r.children && i < r.children.length; ++i) {
                r.extra.push(r.children[i].extra);
            }
        },
        'JSON' : function(r) { r.extra = r.children[0].extra; }
    }

    var parser = paka.create(grammar, actions);
    var ast = parser.parse('JSON', src);

    return ast;
}
```
