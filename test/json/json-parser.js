#!/usr/bin/env node

// JSON grammar reference: http://www.json.org/fatfree.html

var paka = require('../../paka.js');
var path = require('path');
var util = require('util');

var PROGRAM = path.basename(process.argv[1]);

function help() {
    console.log('Example: ' + PROGRAM + '{ "k1" : "v1", "k2" : 123, "k3" : false, "k4" : null }');
}

function parse(src) {
    var NUM = paka.NUM;
    var EOF = paka.EOF;
    var CONCAT = paka.CONCAT;
    var OR = paka.OR;
    var REPEAT = paka.REPEAT;
    var OPT = paka.OPT;
    var DQ_STR = paka.DQ_STR;
    var ENCLOSED_LIST = paka.ENCLOSED_LIST;
    var $ = paka.$;
    
    var grammar = {
        'JSON' : CONCAT($('Value'), EOF),
        'Value' : OR($('Num'), $('Null'), $('Bool'), $('String'), $('Object'), $('Array')),
        'Object' : ENCLOSED_LIST('{', $('KeyValuePair'), ',', '}'),
        'KeyValuePair' : CONCAT($('Key'), ':', $('Value')),
        'Key' : $('String'),
        'Num' : NUM(),
        'Null' : 'null',
        'Bool' : OR('false', 'true'),
        'String' : DQ_STR(),
        'Array' : ENCLOSED_LIST('[', $('Value'), ',', ']')
    };

    var actions = {
        'Num' : function(r) { r.extra = parseFloat(r.text()); },
        'Null' : function(r) { r.extra = null },
        'Bool' : function(r) { r.extra = ('true' == r.text()); },
        'String' : function(r) { 
            var str = r.text().substring(1, r.text().length - 1);
            var escape_map = { '\\\\' : '\\', '\\"' : '"', '\\/' : '/', '\\b' : '\b', '\\f' : '\f', '\\n' : '\n', '\\r' : '\r', '\\t' : '\t' };
            for (var key in escape_map) {
                str = str.replace(key, escape_map[key]);
            }
            r.extra = str;
        },
        'Key' : function(r) { },
        'Value' : function(r) { r.extra = r.children[0].extra; },
        'KeyValuePair' : function(r) { r.extra = { key : r.children[0].extra, value : r.children[2].extra }; },
        'Object' : function(r) { 
            r.extra = {};
            for (var i = 0; null != r.children && i < r.children.length; ++i) {
                r.extra[r.children[i].extra.key] = r.children[i].extra.value;
            }
        },
        'Array' : function(r) {
            r.extra = [];
            for (var i = 0; null != r.children && i < r.children.length; ++i) {
                r.extra.push(r.children[i].extra);
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
