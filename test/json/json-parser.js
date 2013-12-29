#!/usr/bin/env node

var paka = require('../../paka.js');
var path = require('path');
var util = require('util');

var PROGRAM = path.basename(process.argv[1]);

function help() {
    console.log('Example: ' + PROGRAM + '{ "k1" : "v1", "k2" : 123, "k3" : false, "k4" : null }');
}

function escape_str(str) {
    return str.substring(1, str.length - 1).replace('\\\\', '\\').replace('\\"', '"');
}

function parse(src) {
    var INT = paka.INT;
    var EOF = paka.EOF;
    var CONCAT = paka.CONCAT;
    var OR = paka.OR;
    var REPEAT = paka.REPEAT;
    var OPT = paka.OPT;
    var DQ_STR = paka.DQ_STR;
    var $ = paka.$;
    

    var grammar = {
        'JSON' : CONCAT($('Object'), EOF),
        'Object' : CONCAT('{', OPT($('KeyValueList')), '}'),
        'KeyValueList' : CONCAT($('KeyValuePair'), REPEAT(CONCAT(',', $('KeyValuePair')), 0)),
        'KeyValuePair' : CONCAT($('Key'), ':', $('Value')),
        'Key' : $('String'),
        'Value' : OR($('Num'), $('Null'), $('Bool'), $('String'), $('Object')),
        'Num' : INT(),
        'Null' : 'null',
        'Bool' : OR('false', 'true'),
        'String' : DQ_STR()
    };

    var action = {
        'Num' : function(r) { r.extra = parseInt(r.text()); },
        'Null' : function(r) { r.extra = null },
        'Bool' : function(r) { r.extra = ('true' == r.text()); },
        'String' : function(r) { r.extra = escape_str(r.text()); },
        'Key' : function(r) { },
        'Value' : function(r) { r.extra = r.children[0].extra; },
        'KeyValuePair' : function(r) { r.extra = { key : r.children[0].extra, value : r.children[2].extra }; },
        'KeyValueList' : function(r) { 
            r.extra = {};
            r.extra[r.children[0].extra.key] = r.children[0].extra.value;
            for (var i = 0; i < r.children[1].children.length; ++i) {
                var kv = r.children[1].children[i].children[1];
                r.extra[kv.extra.key] = kv.extra.value;
            }
        },
        'Object' : function(r) { 
            if (null != r.children[1].children && null != r.children[1].children[0])  {
                r.extra = r.children[1].children[0].extra; 
            }
            else {
                r.extra = {};
            }
        },
        'JSON' : function(r) { r.extra = r.children[0].extra; }
    }

    var parser = paka.define(grammar, action);
    var ast = parser.parse('JSON', src);

    //console.log(util.inspect(ast, false, 10));

    return ast;
}

module.exports = { parse : parse };
