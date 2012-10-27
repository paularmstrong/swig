all:
	@npm install -d
	@cp scripts/githooks/* .git/hooks/
	@chmod -R +x .git/hooks/

browser:
	@scripts/browser.sh

tests := $(shell find ./tests -name '*.test.js' ! -path "*node_modules/*")
reporter = dot
opts =
test:
	@node_modules/mocha/bin/mocha --reporter ${reporter} ${opts} ${tests}

files := $(shell find . -name '*.js' ! -path "*node_modules/*" ! -path "*dist/*")
lint:
	@node_modules/nodelint/nodelint ${files} --config=scripts/config-lint.js

out = tests/coverage.html
coverage:
	# NOTE: You must have node-jscoverage installed:
	# https://github.com/visionmedia/node-jscoverage
	# The jscoverage npm module and original JSCoverage packages will not work
	@jscoverage lib lib-cov
	@SWIG_COVERAGE=1 $(MAKE) test reporter=html-cov > ${out}
	@rm -rd lib-cov
	@echo
	@echo "Built Report to ${out}"
	@echo

speed:
	@node tests/speed.js

.PHONY: all browser test lint coverage speed
