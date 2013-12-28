#!/usr/bin/env node

var parser = require('./json-parser.js');

var json1 = '{}'
var ast1 = parser.parse(json1);
console.log(json1 + ' --> ' + ast1.status);

var json2 = '{ "k1" : "v1", "k2" : 1234, "k3" : false, "k4" : null }'
var ast2 = parser.parse(json2);
console.log(json2 + ' --> ' + ast2.status);

var json2 = '{ k1 : "v1", "k2" : 1234, "k3" : false, "k4" : null }'
var ast2 = parser.parse(json2);
console.log(json2 + ' --> ' + ast2.status);
