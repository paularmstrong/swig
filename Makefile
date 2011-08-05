all:
	@echo ''

test:
	@node tests/tests.js

lint:
	@node scripts/runlint.js

.PHONY: all test lint