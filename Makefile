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

clean:
	@rm -rf ${TMP}
	@rm tests/coverage.html

build:
	@scripts/browser.sh

tests := $(shell find ./tests/node -name '*.test.js' ! -path "*node_modules/*")
reporter = dot
opts =
test:
	@${BIN}/mocha --reporter ${reporter} ${opts} ${tests} --globals "_swigglobaltest"

test-browser: build
	@${BIN}/mocha-phantomjs tests/browser/index.html

files := $(shell find . -name '*.js' ! -path "./node_modules/*" ! -path "./dist/*" ! -path "./tests/browser/*" ! -path "./docs*")
lint:
	@${BIN}/nodelint ${files} --config=scripts/config-lint.js

out = tests/coverage.html
cov-reporter = html-cov
coverage:
ifeq (${cov-reporter}, travis-cov)
	@${BIN}/mocha ${opts} ${tests} --globals "_swigglobaltest" --require blanket -R ${cov-reporter}
else
	@${BIN}/mocha ${opts} ${tests} --globals "_swigglobaltest" --require blanket -R ${cov-reporter} > ${out}
	@sed -i .bak -e "s/${PWD}//g" ${out}
	@${BIN}/opener ${out}
	@rm ${out}.bak
	@echo
	@echo "Built Report to ${out}"
	@echo
endif

speed:
	@node tests/speed.js

docs: all clean build coverage
	@mkdir -p docs/css
	@${BIN}/lessc --yui-compress --include-path=docs/less docs/less/swig.less docs/css/swig.css
	@${BIN}/still docs -o ${TMP} -i "layout" -i "json" -i "less"
	@cp ${out} ${TMP}/
	@mkdir -p ${TMP}/js
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
test-docs:
	@${BIN}/still-server docs/ -p ${port} -o

.PHONY: all build test test-browser lint coverage speed docs test-docs
