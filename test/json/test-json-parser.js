#!/usr/bin/env node

var parser = require('./json-parser.js');

var json = '{}'
var ast = parser.parse(json);
console.log(json + ' --> ' + ast.status);

var json = '{ "k1" : "v1", "k2" : 1234, "k3" : false, "k4" : null }'
var ast = parser.parse(json);
console.log(json + ' --> ' + ast.status);

var json = '{ "k 1" : "v 1", "k\\"2" : "v\\"2" }'
var ast = parser.parse(json);
console.log(json + ' --> ' + ast.status);

var json = '{ k1 : "v1", "k2" : 1234, "k3" : false, "k4" : null }'
var ast = parser.parse(json);
console.log(json + ' --> ' + ast.status);
