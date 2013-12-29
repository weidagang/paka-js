#!/usr/bin/env node

var parser = require('./json-parser.js');

function print_result(ast) {
    console.log("[Input]:")
    console.log(json)
    console.log("")
    console.log("[Output]:")
    console.log(ast.status)
    console.log(ast.extra);
    console.log("--------------------\n");
}

var json = '{}'
var ast = parser.parse(json);

var json = '{ "k1" : "v1", "k2" : 1234, "k3" : false, "k4" : null, "k5" : { "k 51" : "v 51", "k 52" : 52} }'
var ast = parser.parse(json);
print_result(ast);

var json = '{ "k 1" : "v 1", "k\\"2" : "v\\"2" }'
var ast = parser.parse(json);
print_result(ast);

var json = '{ k1 : "v1", "k2" : 1234, "k3" : false, "k4" : null }'
var ast = parser.parse(json);
print_result(ast);
