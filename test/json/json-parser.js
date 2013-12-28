#!/usr/bin/env node

var paka = require('../../paka.js');
var path = require('path');
var util = require('util');

var PROGRAM = path.basename(process.argv[1]);

function help() {
    console.log('Example: ' + PROGRAM + '{ "k1" : "v1", "k2" : 123, "k3" : false, "k4" : null }');
}

function parse(src) {
    var INT = paka.INT;
    var EOF = paka.EOF;
    var _SEQ_ = paka._SEQ_;
    var OR = paka.OR;
    var REPEAT = paka.REPEAT;
    var OPT = paka.OPT;
    var STR = paka.STR;
    var CHAR = paka.CHAR;
    var NCHAR = paka.NCHAR;
    var $ = paka.$;

    var grammar = {
        'JSON' : _SEQ_('{', OPT($('KeyValueList')), '}', EOF),
        'KeyValueList' : _SEQ_($('KeyValuePair'), REPEAT(_SEQ_(',', $('KeyValuePair')), 0)),
        'KeyValuePair' : _SEQ_($('Key'), ':', $('Value')),
        'Key' : $('String'),
        'Value' : OR($('Num'), $('Null'), $('Bool'), $('String')),
        'Num' : INT(),
        'Null' : STR('null'),
        'Bool' : OR('false', 'true'),
        'String' : _SEQ_('"', REPEAT(NCHAR('"'), 0), '"')
    };

    var action = {
    }

    var parser = paka.define(grammar, action);
    var ast = parser.parse('JSON', src);

    //console.log(util.inspect(ast, false, 10));

    return ast;
}

module.exports = { parse : parse };
