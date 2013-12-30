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

    var action = {
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
