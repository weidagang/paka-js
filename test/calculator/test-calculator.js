#!/usr/bin/env node

var calculator = require('./calculator.js');

calculator.calculate('1.1 + 1.5');
console.log('');

calculator.calculate('-1 + 1');
console.log('');

calculator.calculate('((1e+8+1))');
console.log('');

calculator.calculate('((1+1) * (2+2))');
console.log('');

calculator.calculate('(123 - 3) * 2 - 6 / (1 + 1)');
console.log('');

calculator.calculate('-123 + 2 * 3 - 6 / -3');
console.log('');

calculator.calculate('-123 + 2  3');
console.log('');

calculator.calculate('((-123 + 2');
console.log('');

calculator.calculate('(-123 + 2) ** 3');
console.log('');
