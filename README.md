paka.js 
=======

Paka.js is a higher-order function based parser combinator. It's designed for creating language parsers in JavaScript. Unlike external parser generators such as ANTLR, there's no static code generation involved. When writing language parsers in JavaScript, you can define the language grammar and semantics actions with an embedded DSL, it is much light-weighted than external parser generators.

**Example**

The following code implements a working caculator in less than 100 lines of code. The hightlight is that the language grammar is written in the embedded DSL, it's clean and easy to maintain.

```javascript
var paka = require('paka');

function calculate(src) {
    var INT = paka.INT;
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
        'Num' : INT()
    };

    var actions = {
        'Num' : function(r) { r.extra = parseInt(r.text()); },
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

    var parser = paka.define(grammar, actions);
    var ast = parser.parse('Arithmetic', src);

    if (paka.S.OK == ast.status) {
        console.log(src + ' = ' + ast.extra);
    }
    else {
        console.error('Invalid expression');
    }
}
```
