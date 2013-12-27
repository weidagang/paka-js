paka.js 
=======

paka.js is a higher-order function based parser combinator. A parser combinator can be considered as an embedded parser generator. Unlike external parser generators such as ANTLR, there's no static code generation in Paka.js. The embedded DSL of paka.js is in pure JavaScript, so for writing a parser in JavaScript, it is much easier and light-weighted than external parser generators.

**Example**

The following code implements a caculator with paka.js in less than 100 lines of JavaScript.

```javascript
var paka = require('../../paka.js');
var path = require('path');
var util = require('util');

var PROGRAM = path.basename(process.argv[1]);

function help() {
    console.log('Example: ' + PROGRAM + ' "(1 + 2) * 3 - 1"');
}

function calculate(src) {
    var INT = paka.INT;
    var _SEQ_ = paka._SEQ_;
    var OR = paka.OR;
    var REPEAT = paka.REPEAT;
    var OPT = paka.OPT;
    var $ = paka.$;

    var grammar = {
        'Expr' : _SEQ_( $('Term'), $('Terms')),
        'Term' : _SEQ_( $('Factor'), $('Factors') ),
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
        'P-Expr' : function(r) { r.extra = r.children[1].extra; }
    }

    var parser = paka.define(grammar, action);
    var ast = parser.parse('Expr', src);

    //console.log(util.inspect(ast, false, 10));
    
    if (paka.S.OK == ast.status && ast.length == src.length) {
        console.log(src + ' = ' + ast.extra);
    }
    else {
        console.error("Invalid expression, column " + ast.length + ':');
        var left = src.substring(ast.length - 20, ast.length);
        var right = src.substring(ast.length, ast.length + 20);
        console.error(left + right);
        var sp = '';
        for (var i = 0; i < left.length; ++i) {
            sp += ' ';
        }
        console.error(sp + '^^^');
    }
}
```
