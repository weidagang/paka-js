.PHONY: all
all: paka.js

.PHONY: clean
clean: 
	rm -f paka.js 

paka.js: paka.ts
	tsc --module commonjs paka.ts 

.PHONY: paka-unit-test 
paka-unit-test: paka.js
	node test/unit-test.js 

.PHONY: test-calculator
test-calculator: paka.js
	node test/calculator/test-calculator.js

.PHONY: test
test: paka-unit-test
