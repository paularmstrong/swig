all:
	@npm install -d
	@cp scripts/githooks/* .git/hooks/
	@chmod -R +x .git/hooks/

browser:
	@scripts/browser.sh

tests := $(shell find . -name '*.test.js' ! -path "*node_modules/*" ! -path "*dist/*")
reporter = skip_passed
test:
	@node_modules/nodeunit/bin/nodeunit --reporter ${reporter} ${tests}

files := $(shell find . -name '*.js' ! -path "*node_modules/*" ! -path "*dist/*")
lint:
	@node_modules/nodelint/nodelint ${files} --config=scripts/config-lint.js

speed:
	@node tests/speed.js

.PHONY: all browser test lint speed