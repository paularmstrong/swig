SHA := $(shell git rev-parse HEAD)
THIS_BRANCH := $(shell git rev-parse --abbrev-ref HEAD)

TMP = 'tmp_build'
REMOTE = origin
BRANCH = gh-pages

all:
	@npm install -d
	@cp scripts/githooks/* .git/hooks/
	@chmod -R +x .git/hooks/

clean:
	@rm -rf ${TMP}

build:
	@scripts/browser.sh

tests := $(shell find ./tests/node -name '*.test.js' ! -path "*node_modules/*")
reporter = dot
opts =
test:
	@node_modules/mocha/bin/mocha --reporter ${reporter} ${opts} ${tests} --globals "_swigglobaltest"

test-browser: build
	@node_modules/mocha-phantomjs/bin/mocha-phantomjs tests/browser/index.html

files := $(shell find . -name '*.js' ! -path "./node_modules/*" ! -path "./dist/*" ! -path "./tests/browser/*" ! -path "./docs*")
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

docs: all clean build
	@mkdir -p docs/css
	@node_modules/.bin/lessc --yui-compress --include-path=docs/less docs/less/swig.less docs/css/swig.css
	@node_modules/.bin/still docs -o ${TMP} -i "layout" -i "json" -i "less"
	@mkdir -p ${TMP}/js
	@cp dist/swig.* ${TMP}/js/
	@cp node_modules/zepto/zepto.min.js ${TMP}/js/lib
	@git checkout ${BRANCH}
	@cp -r ${TMP}/* ./
	@rm -rf ${TMP}
	@git add .
	@git commit -n -am "Automated build from ${SHA}"
	@git push ${REMOTE} ${BRANCH}
	@git checkout ${THIS_BRANCH}

port = 3000
test-docs:
	@node_modules/.bin/still-server docs/ -p ${port} -o

.PHONY: all build test test-browser lint coverage speed docs test-docs
