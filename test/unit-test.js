#!/usr/bin/env node

var paka = require('../paka.js');
var assert = require('assert');

function test_WS() {
    var case_name = arguments.callee.name;
    var case_i = 0;
    console.log('Begin case ' + case_name);

    var WS = paka.WS;
    var S = paka.S;
    var R = paka.R;
    
    // no min and max
    var r = WS()(" foo ", 0);
    assert(S.OK == r.status && r.length == 1, case_name + "." + (++case_i));

    var r = WS()("\t", 0);
    assert(S.OK == r.status && r.length == 1, case_name + "." + (++case_i));

    var r = WS()(" \tfoo ", 0);
    assert(S.OK == r.status && r.length == 2, case_name + "." + (++case_i));

    // min
    var r = WS(0)("foo", 0);
    assert(S.OK == r.status && r.length == 0, case_name + "." + (++case_i));

    var r = WS(2)("  ", 0);
    assert(S.OK == r.status && r.length == 2, case_name + "." + (++case_i));

    var r = WS(2)(" \t ", 0);
    assert(S.OK == r.status && r.length == 3, case_name + "." + (++case_i));

    var r = WS(2)("   foo ", 0);
    assert(S.OK == r.status && r.length == 3, case_name + "." + (++case_i));

    var r = WS(1)("", 0);
    assert(S.ERROR == r.status, case_name + "." + (++case_i));

    var r = WS(1)("foo   ", 0);
    assert(S.ERROR == r.status, case_name + "." + (++case_i));

    var r = WS(2)(" ", 0);
    assert(S.ERROR == r.status, case_name + "." + (++case_i));

    var r = WS(2)(" foo   ", 0);
    assert(S.ERROR == r.status, case_name + "." + (++case_i));

    // max
    var r = WS(3, 3)("   ", 0);
    assert(S.OK == r.status && r.length == 3, case_name + "." + (++case_i));

    var r = WS(1, 3)("  \tfoo\t ", 0);
    assert(S.OK == r.status && r.length == 3, case_name + "." + (++case_i));

    var r = WS(3, 3)("\t\t\t\t", 0);
    assert(S.OK == r.status && r.length == 3, case_name + "." + (++case_i));

    console.log('Case ' + case_name + ' passed');
}

function test_ALPH() {
    var case_name = arguments.callee.name;
    var case_i = 0;
    console.log('Begin case ' + case_name);

    var ALPH = paka.ALPH;
    var S = paka.S;
    var R = paka.R;
    var P = paka.P;
    
    var r = ALPH()("f", 0);
    assert(S.OK == r.status && P.ALPH == r.operator && r.length == 1, case_name + "." + (++case_i));

    var r = ALPH()("foo bar", 0);
    assert(S.OK == r.status && P.ALPH == r.operator && r.index == 0 && r.length == 1, case_name + "." + (++case_i));

    var r = ALPH()(" foo bar", 1);
    assert(S.OK == r.status && P.ALPH == r.operator && r.index == 1 && r.length == 1, case_name + "." + (++case_i));

    var r = ALPH()("1 foo bar", 0);
    assert(S.ERROR == r.status && P.ALPH == r.operator && r.index == 0 && r.length == 0, case_name + "." + (++case_i));

    var r = ALPH()("foo bar", 7);
    assert(S.ERROR == r.status && P.ALPH == r.operator && r.index == 7 && r.length == 0, case_name + "." + (++case_i));

    console.log('Case ' + case_name + ' passed');
}

function test_DIGIT() {
    var case_name = arguments.callee.name;
    var case_i = 0;
    console.log('Begin case ' + case_name);

    var DIGIT = paka.DIGIT;
    var S = paka.S;
    var R = paka.R;
    var P = paka.P;
    
    var r = DIGIT()("123", 0);
    assert(S.OK == r.status && P.DIGIT == r.operator && r.length == 1, case_name + "." + (++case_i));

    var r = DIGIT()("123 234", 0);
    assert(S.OK == r.status && P.DIGIT == r.operator && r.length == 1, case_name + "." + (++case_i));

    var r = DIGIT()(" 123 234", 1);
    assert(S.OK == r.status && P.DIGIT == r.operator && r.index == 1 && r.length == 1, case_name + "." + (++case_i));

    var r = DIGIT()("f 123 234", 0);
    assert(S.ERROR == r.status && P.DIGIT == r.operator && r.index == 0 && r.length == 0, case_name + "." + (++case_i));

    var r = DIGIT()("123 234", 7);
    assert(S.ERROR == r.status && P.DIGIT == r.operator && r.index == 7 && r.length == 0, case_name + "." + (++case_i));

    console.log('Case ' + case_name + ' passed');
}

function test_INT() {
    var case_name = arguments.callee.name;
    var case_i = 0;
    console.log('Begin case ' + case_name);

    var INT = paka.INT;
    var S = paka.S;
    var R = paka.R;
    var P = paka.P;
    
    var r = INT()("123", 0);
    assert(S.OK == r.status && P.INT == r.operator && r.length == 3, case_name + "." + (++case_i));

    var r = INT(3)("123", 0);
    assert(S.OK == r.status && P.INT == r.operator && r.length == 3, case_name + "." + (++case_i));

    var r = INT(2)("123", 0);
    assert(S.OK == r.status && P.INT == r.operator && r.length == 2, case_name + "." + (++case_i));

    var r = INT()("-123", 0);
    assert(S.OK == r.status && P.INT == r.operator && r.length == 4, case_name + "." + (++case_i));

    var r = INT(2)("-123", 0);
    assert(S.OK == r.status && P.INT == r.operator && r.length == 3, case_name + "." + (++case_i));

    var r = INT()("0", 0);
    assert(S.OK == r.status && P.INT == r.operator && r.length == 1, case_name + "." + (++case_i));

    var r = INT()("-", 0);
    assert(S.ERROR == r.status && P.INT == r.operator, case_name + "." + (++case_i));

    console.log('Case ' + case_name + ' passed');
}

function test_UINT() {
    var case_name = arguments.callee.name;
    var case_i = 0;
    console.log('Begin case ' + case_name);

    var UINT = paka.UINT;
    var S = paka.S;
    var R = paka.R;
    var P = paka.P;
    
    var r = UINT()("123", 0);
    assert(S.OK == r.status && P.UINT == r.operator && r.length == 3, case_name + "." + (++case_i));

    var r = UINT(3)("123", 0);
    assert(S.OK == r.status && P.UINT == r.operator && r.length == 3, case_name + "." + (++case_i));

    var r = UINT(2)("123", 0);
    assert(S.OK == r.status && P.UINT == r.operator && r.length == 2, case_name + "." + (++case_i));

    var r = UINT()("-123", 0);
    assert(S.ERROR == r.status && P.UINT == r.operator, case_name + "." + (++case_i));

    var r = UINT()("0", 0);
    assert(S.OK == r.status && P.UINT == r.operator && r.length == 1, case_name + "." + (++case_i));

    var r = UINT()("-", 0);
    assert(S.ERROR == r.status && P.UINT == r.operator, case_name + "." + (++case_i));

    console.log('Case ' + case_name + ' passed');
}

function test_STR() {
    var case_name = arguments.callee.name;
    var case_i = 0;
    console.log('Begin case ' + case_name);

    var STR = paka.STR;
    var S = paka.S;
    var R = paka.R;
    
    var r = STR("+")("+", 0);
    assert(S.OK == r.status && r.length == 1, case_name + "." + (++case_i));

    var r = STR(" ")(" ", 0);
    assert(S.OK == r.status && r.length == 1, case_name + "." + (++case_i));

    var r = STR("foo")("foo", 0);
    assert(S.OK == r.status && r.length == 3, case_name + "." + (++case_i));

    var r = STR("foo")(" foo bar", 0);
    assert(S.ERROR == r.status, case_name + "." + (++case_i));

    var r = STR("+")(" + ", 0);
    assert(S.ERROR == r.status, case_name + "." + (++case_i));

    var r = STR("+")("+", 1);
    assert(S.ERROR == r.status, case_name + "." + (++case_i));

    console.log('Case ' + case_name + ' passed');
}

function test_CHAR() {
    var case_name = arguments.callee.name;
    var case_i = 0;
    console.log('Begin case ' + case_name);

    var CHAR = paka.CHAR;
    var S = paka.S;
    var R = paka.R;
    
    var r = CHAR("+-*/")("+", 0);
    assert(S.OK == r.status && r.length == 1, case_name + "." + (++case_i));

    var r = CHAR("+-*/")("+-*/", 0);
    assert(S.OK == r.status && r.length == 1, case_name + "." + (++case_i));

    var r = CHAR("*/+-")("-foo", 0);
    assert(S.OK == r.status && r.length == 1, case_name + "." + (++case_i));

    var r = CHAR("*/+-")("?foo", 0);
    assert(S.ERROR == r.status, case_name + "." + (++case_i));

    var r = CHAR("*/+-")("foo+bar", 0);
    assert(S.ERROR == r.status, case_name + "." + (++case_i));

    console.log('Case ' + case_name + ' passed');
}

function test_SEQ() {
    var case_name = arguments.callee.name;
    var case_i = 0;
    console.log('Begin case ' + case_name);

    var WS = paka.WS ;
    var STR = paka.STR;
    var SEQ = paka.SEQ;
    var S = paka.S;
    var R = paka.R;
    
    var r = SEQ(STR('foo'))("foo bar", 0);
    assert(S.OK == r.status && r.index == 0 && r.length == 3, case_name + "." + (++case_i));

    var r = SEQ('foo')("foo bar", 0);
    assert(S.OK == r.status && r.index == 0 && r.length == 3, case_name + "." + (++case_i));

    var r = SEQ(STR('foo'), WS(1), STR('bar'))("foo bar", 0);
    assert(S.OK == r.status && r.index == 0 && r.length == 7, case_name + "." + (++case_i));

    var r = SEQ('foo', WS(1), 'bar')("foo bar", 0);
    assert(S.OK == r.status && r.index == 0 && r.length == 7, case_name + "." + (++case_i));

    var r = SEQ(SEQ(STR('foo'), WS(1), STR('bar'), STR("=")))("foo bar=", 0);
    assert(S.OK == r.status && r.index == 0 && r.length == 8, case_name + "." + (++case_i));

    var r = SEQ(STR('foo'), WS(1), STR('bar'))("bar foo", 0);
    assert(S.ERROR == r.status, case_name + "." + (++case_i));

    console.log('Case ' + case_name + ' passed');
}

function test_CONCAT() {
    var case_name = arguments.callee.name;
    var case_i = 0;
    console.log('Begin case ' + case_name);

    var WS = paka.WS ;
    var STR = paka.STR;
    var CONCAT = paka.CONCAT;
    var S = paka.S;
    var R = paka.R;
    
    var r = CONCAT(STR('foo'))("foo bar", 0);
    assert(S.OK == r.status && r.index == 0 && r.length == 4, case_name + "." + (++case_i));

    var r = CONCAT('foo', 'bar')(" foo  bar ", 0);
    assert(S.OK == r.status && r.index == 0 && r.length == 10, case_name + "." + (++case_i));

    var r = CONCAT('foo', '+', 'bar')("foo + bar", 0);
    assert(S.OK == r.status && r.index == 0 && r.length == 9, case_name + "." + (++case_i));

    console.log('Case ' + case_name + ' passed');
}

function test_OR() {
    var case_name = arguments.callee.name;
    var case_i = 0;
    console.log('Begin case ' + case_name);

    var WS = paka.WS ;
    var STR = paka.STR;
    var SEQ = paka.SEQ;
    var OR = paka.OR;
    var S = paka.S;
    var R = paka.R;
    
    var r = OR(STR('foo'), STR('ba'))("foo ba", 0);
    assert(S.OK == r.status && r.length == 3, case_name + "." + (++case_i));

    var r = OR(STR('ba'), STR('foo'))("foo ba", 0);
    assert(S.OK == r.status && r.length == 3, case_name + "." + (++case_i));

    var r = OR(SEQ(STR('foo'), WS(1), STR('bar')), STR('foo'))("foo bar", 0);
    assert(S.OK == r.status && r.length == 7, case_name + "." + (++case_i));

    var r = OR(STR('foo'), SEQ(STR('foo'), WS(1), STR('bar')))("foo bar", 0);
    assert(S.OK == r.status && r.length == 3, case_name + "." + (++case_i));

    var r = OR(STR('foo'), STR('bar'))("fo ba", 0);
    assert(S.ERROR == r.status, case_name + "." + (++case_i));

    console.log('Case ' + case_name + ' passed');
}

function test_REPEAT() {
    var case_name = arguments.callee.name;
    var case_i = 0;
    console.log('Begin case ' + case_name);

    var WS = paka.WS ;
    var STR = paka.STR;
    var SEQ = paka.SEQ;
    var OR = paka.OR;
    var REPEAT = paka.REPEAT;
    var S = paka.S;
    var R = paka.R;
    var P = paka.P;
    
    var r = REPEAT(STR('foo'))(' foofoofoo', 1);
    assert(S.OK == r.status && P.REPEAT == r.operator && r.index == 1 && r.length == 9 && r.children.length == 3
        , case_name + "." + (++case_i));
    
    var src = ' foo ha foo ';
    var r = REPEAT(OR(STR('foo'), STR('ha'), WS()))(src, 0);
    assert(S.OK == r.status && P.REPEAT == r.operator && r.index == 0 && r.length == src.length
        , case_name + "." + (++case_i));

    var r = REPEAT(STR('foo'), 3)(' foofoofoo', 1);
    assert(S.OK == r.status && P.REPEAT == r.operator && r.index == 1 && r.length == 9
        , case_name + "." + (++case_i));

    var r = REPEAT(STR('foo'), 3)(' foofoofoo', 1);
    assert(S.OK == r.status && P.REPEAT == r.operator && r.index == 1 && r.length == 9 && r.children.length == 3
        , case_name + "." + (++case_i));

    var r = REPEAT(STR('foo'), 1, 2)(' foofoofoo', 1);
    assert(S.OK == r.status && P.REPEAT == r.operator  && r.index == 1 && r.length == 6 && r.children.length == 2
        , case_name + "." + (++case_i));

    var r = REPEAT(STR('foo'), 0, 2)('blabla foo', 0);
    assert(S.OK == r.status && P.REPEAT == r.operator && r.index == 0 && r.length == 0 && r.children.length == 0
        , case_name + "." + (++case_i));

    var r = REPEAT(STR('foo'))(' foofoofoo', 0);
    assert(S.OK == r.status && P.REPEAT == r.operator && r.children.length == 0
        , case_name + "." + (++case_i));

    var r = REPEAT(STR('foo'), 4)(' foofoofoo', 1);
    assert(S.ERROR == r.status && P.REPEAT == r.operator && r.children.length == 3
        , case_name + "." + (++case_i));

    console.log('Case ' + case_name + ' passed');
}

function test_OPT() {
    var case_name = arguments.callee.name;
    var case_i = 0;
    console.log('Begin case ' + case_name);

    var WS = paka.WS ;
    var STR = paka.STR;
    var SEQ = paka.SEQ;
    var OR = paka.OR;
    var REPEAT = paka.REPEAT;
    var OPT = paka.OPT;
    var S = paka.S;
    var R = paka.R;
    var P = paka.P;
    
    var r = OPT(STR('foo'))('foo bar', 0);
    assert(S.OK == r.status && P.OPT == r.operator && r.index == 0 && r.length == 3 && r.children.length == 1
        , case_name + "." + (++case_i));

    var r = OPT(STR('foo'))('bar foo', 0);
    assert(S.OK == r.status && P.OPT == r.operator && r.index == 0 && r.length == 0 && r.children.length == 0
        , case_name + "." + (++case_i));

    var r = SEQ(STR('foo'), OPT(WS()), STR('+'), OPT(WS()), STR('bar'))('foo+bar', 0);
    assert(S.OK == r.status && P.SEQ == r.operator && r.index == 0 && r.length == 7 && r.children.length == 5
        , case_name + "." + (++case_i));

    var r = SEQ(STR('foo'), OPT(WS()), STR('+'), OPT(WS()), STR('bar'))('foo + bar', 0);
    assert(S.OK == r.status && P.SEQ == r.operator && r.index == 0 && r.length == 9 && r.children.length == 5
        , case_name + "." + (++case_i));

    console.log('Case ' + case_name + ' passed');
}

function test_$() {
    var case_name = arguments.callee.name;
    var case_i = 0;
    console.log('Begin case ' + case_name);

    var WS = paka.WS ;
    var STR = paka.STR;
    var SEQ = paka.SEQ;
    var OR = paka.OR;
    var REPEAT = paka.REPEAT;
    var $ = paka.$;

    var S = paka.S;
    var R = paka.R;
    var P = paka.P;

    var grammar = {
        'C' : SEQ($('A'), STR('+'), $('B')),
        'A' : STR('foo'),
        'B' : STR('bar')
    };

    var parser = paka.define(grammar);

    var r = parser.parse('C', 'foo+bar');
    assert(S.OK == r.status && 'C' == r.rule && P.SEQ == r.operator && r.index == 0 && r.length == 7
        , case_name + "." + (++case_i));

    var r = parser.parse('C', 'foo +bar');
    assert(S.ERROR == r.status && 'C' == r.rule , case_name + "." + (++case_i));
    
    console.log('Case ' + case_name + ' passed');
}

test_WS();
test_ALPH();
test_DIGIT();
test_INT();
test_UINT();
test_STR();
test_CHAR();
test_SEQ();
test_CONCAT();
test_OR();
test_REPEAT();
test_OPT();
test_$();
