all:
	@echo ''

lint:
	@node scripts/runlint.js

.PHONY: all lint