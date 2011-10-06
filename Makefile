all:
	@npm install -d
	@cp scripts/githooks/* .git/hooks/
	@chmod -R +x .git/hooks/

browser:
	@scripts/browser.sh

test:
	@node tests/speed.js
	@node scripts/runtests.js

lint:
	@node scripts/runlint.js

.PHONY: all browser test lint