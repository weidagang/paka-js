#!/usr/bin/env node

var paka = require('../../paka.js');
var path = require('path');
var util = require('util');

var PROGRAM = path.basename(process.argv[1]);

function help() {
    console.log('Example: ' + PROGRAM + ' "(1 + 2) * 3 - 1"');
}

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

module.exports = { calculate : calculate };
