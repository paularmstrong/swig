SHA := $(shell git rev-parse HEAD)
THIS_BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
VERSION_REGEX = [0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*[^\" ]*
VERSION := $(shell npm ls | grep "swig@" |  grep -Eo "${VERSION_REGEX}" -m 1)

TMP = 'tmp'
REMOTE = origin
BRANCH = gh-pages
BIN = node_modules/.bin
PWD = $(shell pwd | sed -e 's/[\/&]/\\&/g')

all:
	@echo "Installing packages"
	@npm install --depth=100 --loglevel=error
	@npm link &>/dev/null
	@cp scripts/githooks/* .git/hooks/
	@chmod -R +x .git/hooks/

.INTERMEDIATE version: \
	browser/comments.js \
	docs/index.json

version:
	@sed -i.bak 's/${VERSION_REGEX}/${VERSION}/' lib/swig.js
	@rm lib/swig.js.bak

browser/comments.js: FORCE
	@sed -i.bak 's/v${VERSION_REGEX}/v${VERSION}/' $@
	@rm $@.bak

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

clean: FORCE
	@rm -rf dist
	@rm -rf ${TMP}

build: clean dist dist/swig.min.js
	@echo "Built to ./dist/"

dist:
	@mkdir -p $@

dist/swig.js:
	@echo "Building $@..."
	@cat $^ > $@
	@${BIN}/browserify browser/index.js >> $@

dist/swig.min.js:
	@echo "Building $@..."
	@${BIN}/uglifyjs $^ --comments -c warnings=false -m --source-map dist/swig.js.map > $@

browser/test/tests.js:
	@echo "Building $@..."
	@cat $^ > tests/browser.js
	@perl -pi -e 's/\.\.\/\.\.\/lib/\.\.\/lib/g' tests/browser.js
	@${BIN}/browserify tests/browser.js > $@
	@rm tests/browser.js

tests := $(shell find ./tests -name '*.test.js' ! -path "*node_modules/*")
reporter = dot
opts =
test:
	@${BIN}/mocha --check-leaks --reporter ${reporter} ${opts} ${tests}

test-browser: FORCE clean browser/test/tests.js
	@${BIN}/mocha-phantomjs browser/test/index.html --reporter ${reporter}

files := $(shell find . -name '*.js' ! -path "./node_modules/*" ! -path "./dist/*" ! -path "./browser*" ! -path "./docs*" ! -path "./tmp*")
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

docs/index.json: FORCE
	@echo "Building $@..."
	@sed -i.bak 's/v${VERSION_REGEX}/v${VERSION}/' $@
	@rm $@.bak

docs/docs.json: FORCE
	@echo "Building $@..."
	@sed -i.bak 's/v${VERSION_REGEX}/v${VERSION}/' $@
	@rm $@.bak

docs/coverage.html: FORCE
	@echo "Building $@..."
	@make coverage out=$@

docs/docs/api.json: FORCE
	@echo "Building $@..."
	@echo '{ "api": ' > $@
	@${BIN}/jsdoc lib/swig.js -X >> $@
	@echo '}' >> $@

docs/docs/filters.json: FORCE
	@echo "Building $@..."
	@echo '{ "filters": ' > $@
	@${BIN}/jsdoc lib/filters.js -X >> $@
	@echo '}' >> $@

docs/docs/tags.json: FORCE
	@echo "Building $@..."
	@echo '{ "tags": ' > $@
	@${BIN}/jsdoc lib/tags/ -X >> $@
	@echo '}' >> $@

docs/docs/loaders.json: FORCE
	@echo "Building $@..."
	@echo '{ "loaders": ' > $@
	@${BIN}/jsdoc lib/loaders/ -X >> $@
	@echo '}' >> $@

docs/docs/extending.json: FORCE
	@echo "Building $@..."
	@echo '{ "ext": ' > $@
	@${BIN}/jsdoc lib/parser.js lib/lexer.js -X >> $@
	@echo '}' >> $@

.SECONDARY build-docs: \
	docs/index.json \
	docs/docs.json

.INTERMDIATE build-docs: \
	docs/docs/api.json \
	docs/docs/filters.json \
	docs/docs/tags.json \
	docs/docs/extending.json \
	docs/docs/loaders.json

build-docs: FORCE
	@echo "Documentation built."

gh-pages: clean build build-docs
	@mkdir -p ${TMP}/js
	@mkdir -p docs/css
	@rm -f docs/coverage.html
	@${BIN}/lessc --yui-compress --include-path=docs/less docs/less/swig.less docs/css/swig.css
	@${BIN}/still docs -o ${TMP} -i "layout" -i "json" -i "less" -v
	@make coverage out=${TMP}/coverage.html
	@cp dist/swig.* ${TMP}/js/
	@git checkout ${BRANCH}
	@cp -r ${TMP}/* ./
	@rm -rf ${TMP}
ifeq (${THIS_BRANCH}, master)
	@git add .
	@git commit -n -am "Automated build from ${SHA}"
	@git push ${REMOTE} ${BRANCH}
	@git checkout ${THIS_BRANCH}
	@git clean -f -d docs/
endif

port = 3000
docs: build build-docs
	@${BIN}/still-server docs/ -p ${port} -o

FORCE:

.PHONY: all version \
	build build-docs \
	test test-browser lint coverage \
	docs gh-pages
