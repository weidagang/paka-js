#!/usr/bin/env node

// JSON grammar reference: http://www.json.org/fatfree.html

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
    var LIST = paka.LIST;
    var $ = paka.$;
    
    var grammar = {
        'JSON' : CONCAT($('Value'), EOF),
        'Value' : OR($('Num'), $('Null'), $('Bool'), $('String'), $('Object')),
        'Object' : CONCAT('{', OPT($('KeyValueList')), '}'),
        'KeyValueList' : LIST($('KeyValuePair'), ','),
        'KeyValuePair' : CONCAT($('Key'), ':', $('Value')),
        'Key' : $('String'),
        'Num' : INT(),
        'Null' : 'null',
        'Bool' : OR('false', 'true'),
        'String' : DQ_STR()
    };

    var actions = {
        'Num' : function(r) { r.extra = parseInt(r.text()); },
        'Null' : function(r) { r.extra = null },
        'Bool' : function(r) { r.extra = ('true' == r.text()); },
        'String' : function(r) { r.extra = escape_str(r.text()); },
        'Key' : function(r) { },
        'Value' : function(r) { r.extra = r.children[0].extra; },
        'KeyValuePair' : function(r) { r.extra = { key : r.children[0].extra, value : r.children[2].extra }; },
        'KeyValueList' : function(r) { 
            r.extra = {};
            for (var i = 0; i < r.children.length; ++i) {
                r.extra[r.children[i].extra.key] = r.children[i].extra.value;
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

    var parser = paka.define(grammar, actions);
    var ast = parser.parse('JSON', src);

    //console.log(util.inspect(ast, false, 10));

    return ast;
}

module.exports = { parse : parse };
