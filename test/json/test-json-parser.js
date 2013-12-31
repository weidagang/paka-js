#!/usr/bin/env node

var parser = require('./json-parser.js');

function print_input(json) {
    console.log("[Input]:")
    console.log(json)
    console.log("")
}

function print_output(ast) {
    console.log("[Output]:")
    console.log(ast.status)
    console.log(ast.extra);
    console.log("--------------------\n");
}

var json = '"hello world"';
print_input(json);
var ast = parser.parse(json);
print_output(ast);

var json = '123';
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

var json = '{ "k1" : "v1", "k2" : 1234, "k3" : false, "k4" : null, "k5" : { "k 51" : "v 51", "k 52" : 52}, "k6" : [ "v6" ] }';
print_input(json);
var ast = parser.parse(json);
print_output(ast);

var json = '{ "k 1" : "v 1", "k\\"2" : "a\'b" }';
print_input(json);
var ast = parser.parse(json);
print_output(ast);
