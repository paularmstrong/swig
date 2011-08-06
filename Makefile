all:
	@echo ''

test:
	@node tests/tests.js
	@node scripts/runtests.js

lint:
	@node scripts/runlint.js

.PHONY: all test lint