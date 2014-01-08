#!/usr/bin/env node

var parser = require('./json-parser.js');

function print_input(json) {
    console.log("[Input]:")
    console.log(json)
    console.log("")
}

function print_output(ast) {
    console.log("[Output]:")
    if (ast.matched()) {
        console.log(ast.status)
        console.log(ast.extra);
    }
    else {
        console.log(ast.error_info.to_str());
    }
    console.log("--------------------\n");
}

var json = '"hello world"';
print_input(json);
var ast = parser.parse(json)
print_output(ast);

var json = '123e+8';
print_input(json);
var ast = parser.parse(json);
print_output(ast);

var json = '"\\\\"';
print_input(json);
var ast = parser.parse(json);
print_output(ast);

var json = 'true';
print_input(json);
var ast = parser.parse(json);
print_output(ast);

var json = 'null';
print_input(json);
var ast = parser.parse(json);
print_output(ast);

var json = '{}';
print_input(json);
var ast = parser.parse(json);
print_output(ast);

var json = '[]';
print_input(json);
var ast = parser.parse(json);
print_output(ast);

var json = '[1, "hello", null, { "k1" : "v1" }, [1, 2, 3] ]';
print_input(json);
var ast = parser.parse(json);
print_output(ast);

var json = '{\n "k1" : "v1",\n "k2" : 1234,\n "k3" : false,\n "k4" : null,\n "k5" : { "k 51" : "v 51", "k 52" : 52 },\n "k6" : [ "v6", 66, null ]\n}';
print_input(json);
var ast = parser.parse(json);
print_output(ast);

var json = '{ "k 1" : "v 1", "k\\"2" : "a\'b" }';
print_input(json);
var ast = parser.parse(json);
print_output(ast);

var json = '{\n "k1" : "v1",\n "k2" : 1234,\n "k3" : false,\n "k4" : null,\n "k5" : { "k 51" : v 51", "k 52" : 52 },\n "k6" : [ "v6", 66, null ]\n}';
print_input(json);
var ast = parser.parse(json);
print_output(ast);
