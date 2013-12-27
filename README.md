paka.js
=======

Parser combinator for JavaScript

## Caculator Example ##
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
```
