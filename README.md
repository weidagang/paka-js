paka.js 
=======

Paka.js is a higher-order function based parser combinator. Parser combinator is a kind of embedded parser generator which defines language grammar with an embedded DSL. Unlike external parser generators such as ANTLR, there's no static code generation required. The embedded DSL of paka.js is in pure JavaScript, so for writing language parsers in JavaScript, it is much easier and light-weighted than external parser generators.

**Example**

The following code implements a caculator with paka.js in less than 100 lines of code. With the embedded DSL, the language grammar is very clear and the code is easy to maintain.

```javascript
var paka = require('paka');

function calculate(src) {
    var INT = paka.INT;
    var EOF = paka.EOF;
    var _SEQ_ = paka._SEQ_;
    var OR = paka.OR;
    var REPEAT = paka.REPEAT;
    var OPT = paka.OPT;
    var $ = paka.$;

    var grammar = {
        'Arithmetic' : _SEQ_($('Expr'), EOF),
        'Expr' : _SEQ_($('Term'), $('Terms')),
        'Term' : _SEQ_($('Factor'), $('Factors') ),
        'Terms' : REPEAT(_SEQ_($('TermOp'), $('Term')), 0),
        'TermOp' : OR('+', '-'),
        'Factor' : OR($('P-Expr'), $('Num')),
        'Factors' : REPEAT(_SEQ_($('FactorOp'), $('Factor')), 0),
        'FactorOp' : OR('*', '/'),
        'P-Expr' : _SEQ_('(', $('Expr'), ')'),
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

    //console.log(util.inspect(ast, false, 10));
    
    if (paka.S.OK == ast.status) {
        console.log(src + ' = ' + ast.extra);
    }
    else {
        var err_idx = paka.last_error().index;
        console.error("Invalid expression, column " + err_idx + ':');
        var left = src.substring(err_idx  - 20, err_idx );
        var right = src.substring(err_idx , err_idx  + 20);
        console.error(left + right);
        var sp = '';
        for (var i = 0; i < left.length; ++i) {
            sp += ' ';
        }
        console.error(sp + '^^^');
    }
}
```
