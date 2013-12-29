paka.js 
=======

Paka.js is a higher-order function based parser combinator. It's designed for creating language parsers in JavaScript. Unlike external parser generators such as ANTLR, there's no static code generation involved. With paka.js, you can write language grammars with the higher-order function based DSL. For writing language parsers in JavaScript, it is much light-weighted than external parser generators.

**Example**

The following code implements a working caculator in less than 100 lines of code. The hightlight is that the language grammar is written in the embedded DSL, it's clean and easy to maintain.

```javascript
var paka = require('paka');

function calculate(src) {
    var INT = paka.INT;
    var EOF = paka.EOF;
    var CONCAT = paka.CONCAT;
    var OR = paka.OR;
    var REPEAT = paka.REPEAT;
    var OPT = paka.OPT;
    var $ = paka.$;

    var grammar = {
        'Arithmetic' : CONCAT($('Expr'), EOF),
        'Expr' : CONCAT($('Term'), $('Terms')),
        'Term' : CONCAT($('Factor'), $('Factors') ),
        'Terms' : REPEAT(CONCAT($('TermOp'), $('Term')), 0),
        'TermOp' : OR('+', '-'),
        'Factor' : OR($('P-Expr'), $('Num')),
        'Factors' : REPEAT(CONCAT($('FactorOp'), $('Factor')), 0),
        'FactorOp' : OR('*', '/'),
        'P-Expr' : CONCAT('(', $('Expr'), ')'),
        'Num' : INT()
    };

    var action = {
        'Num' : function(r) { r.extra = parseInt(r.text()); },
        'Factor' : function(r) { r.extra = r.children[0].extra; },
        'Factors' : function(r) { 
            r.extra = 1;
            for (var i = 0; i < r.children.length; ++i) {
                var _seq = r.children[i];
                var factorOp = _seq.children[0];
                var factor = _seq.children[1];
                if ('*' == factorOp.text()) {
                    r.extra *= factor.extra;
                }
                else if ('/' == factorOp.text()) {
                    r.extra /= factor.extra;
                }
            }
        },
        'Term' : function(r) { 
            var factor = r.children[0];
            var factors = r.children[1];
            r.extra = factor.extra * (null != factors ? factors.extra : 1);
        },
        'Terms' : function(r) {
            r.extra = 0;
            for (var i = 0; null != r.children && i < r.children.length; ++i) {
                var _seq = r.children[i];
                var _termOp = _seq.children[0];
                var _term = _seq.children[1];
                if ('+' == _termOp.text()) {
                    r.extra += _term.extra;
                }
                else if ('-' == _termOp.text()) {
                    r.extra -= _term.extra;
                }
            }
        },
        'Expr' : function(r) {
            var term = r.children[0];
            var terms = r.children[1];
            r.extra = term.extra + (terms != null ? terms.extra : 0);
        },
        'P-Expr' : function(r) { r.extra = r.children[1].extra; },
        'Arithmetic' : function(r) { r.extra = r.children[0].extra; }
    }

    var parser = paka.define(grammar, action);
    var ast = parser.parse('Arithmetic', src);
    
    if (paka.S.OK == ast.status) {
        console.log(src + ' = ' + ast.extra);
    }
    else {
        console.error("Invalid expression");
    }
}
```
