SHA := $(shell git rev-parse HEAD)
THIS_BRANCH := $(shell git rev-parse --abbrev-ref HEAD)

TMP = 'tmp_build'
REMOTE = origin
BRANCH = gh-pages
BIN = node_modules/.bin
PWD = $(shell pwd | sed -e 's/[\/&]/\\&/g')

all:
	@npm install -d
	@cp scripts/githooks/* .git/hooks/
	@chmod -R +x .git/hooks/

.SECONDARY dist/swig.js: \
	browser/comments.js

.SECONDARY dist/swig.min.js: \
	dist/swig.js

.INTERMEDIATE browser/test/tests.js: \
	tests/comments.test.js \
	tests/filters.test.js \
	tests/tags.test.js \
	tests/variables.test.js \
	tests/tags/autoescape.test.js \
	tests/tags/else.test.js \
	tests/tags/filter.test.js \
	tests/tags/for.test.js \
	tests/tags/if.test.js \
	tests/tags/macro.test.js \
	tests/tags/raw.test.js \
	tests/tags/set.test.js \
	tests/tags/spaceless.test.js \
	tests/basic.test.js
clean:
	@rm -rf dist
	@rm -rf ${TMP}

build: clean dist dist/swig.min.js
	@echo "Built to ./dist/"

dist:
	@mkdir -p $@

dist/swig.js:
	@cat $^ > $@
	@${BIN}/browserify browser/index.js >> $@

dist/swig.min.js:
	@${BIN}/uglifyjs $^ --comments -c -m > $@

browser/test/tests.js:
	@cat $^ > tests/browser.js
	@perl -pi -e 's/\.\.\/\.\.\/lib/\.\.\/lib/g' tests/browser.js
	@${BIN}/browserify tests/browser.js > $@
	@rm tests/browser.js

tests := $(shell find ./tests -name '*.test.js' ! -path "*node_modules/*")
reporter = dot
opts =
test:
	@${BIN}/mocha --reporter ${reporter} ${opts} ${tests}

test-browser: clean browser/test/tests.js
	@${BIN}/mocha-phantomjs browser/test/index.html --reporter ${reporter}

files := $(shell find . -name '*.js' ! -path "./node_modules/*" ! -path "./dist/*" ! -path "./browser*" ! -path "./docs*")
lint:
	@${BIN}/nodelint ${files} --config=scripts/config-lint.js

out = tests/coverage.html
cov-reporter = html-cov
coverage:
ifeq (${cov-reporter}, travis-cov)
	@${BIN}/mocha ${opts} ${tests} --require blanket -R ${cov-reporter}
else
	@${BIN}/mocha ${opts} ${tests} --require blanket -R ${cov-reporter} > ${out}
	@sed -i .bak -e "s/${PWD}//g" ${out}
	@rm ${out}.bak
	@echo
	@echo "Built Report to ${out}"
	@echo
endif

build-docs:
	@echo '{"api": ' > docs/docs/api.json
	@${BIN}/dox < lib/swig.js >> docs/docs/api.json
	@echo '}' >> docs/docs/api.json
	@echo '{"filters": ' > docs/docs/filters.json
	@${BIN}/dox < lib/filters.js >> docs/docs/filters.json
	@echo '}' >> docs/docs/filters.json
	@echo '{"tags": ' > docs/docs/tags.json
	@${BIN}/dox < lib/tags.js >> docs/docs/tags.json
	@echo '}' >> docs/docs/tags.json

docs: clean build coverage build-docs
	@mkdir -p ${TMP}/js
	@${BIN}/dox < lib/swig.js > docs/docs/api.json
	@mkdir -p docs/css
	@${BIN}/lessc --yui-compress --include-path=docs/less docs/less/swig.less docs/css/swig.css
	@${BIN}/still docs -o ${TMP} -i "layout" -i "json" -i "less"
	@cp ${out} ${TMP}/
	@cp dist/swig.* ${TMP}/js/
	@cp node_modules/zepto/zepto.min.js ${TMP}/js/lib
ifeq (${THIS_BRANCH}, master)
	@git checkout ${BRANCH}
	@cp -r ${TMP}/* ./
	@rm -rf ${TMP}
	@git add .
	@git commit -n -am "Automated build from ${SHA}"
	@git push ${REMOTE} ${BRANCH}
	@git checkout ${THIS_BRANCH}
endif

port = 3000
test-docs: build build-docs
	@${BIN}/still-server docs/ -p ${port} -o

.PHONY: all build build-docs test test-browser browser/test/tests.js lint coverage docs test-docs
