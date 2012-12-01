SHA := $(shell git rev-parse HEAD)
THIS_BRANCH := $(shell git rev-parse --abbrev-ref HEAD)

all:
	@npm install

tmp = 'tmp_build'
clean:
	@rm -rf ${tmp}

get-swig: clean
	@git checkout master
	@make && make build
	@mkdir -p ${tmp}
	@cp -r dist/swig* ${tmp}/
	@git checkout ${THIS_BRANCH}
	@rm views/js/swig*
	@(cd views/js && ln -s ../../dist/swig.js ./swig.js)
	@(cd views/js && ln -s ../../dist/swig.min.js ./swig.min.js)
	@(cd views/js && ln -s ../../dist/swig.pack.js ./swig.pack.js)
	@(cd views/js && ln -s ../../dist/swig.pack.min.js ./swig.pack.min.js)
	@git commit -n -am "Automated updating swig.js" &>/dev/null


remote=dev
branch=gh-pages
build: clean
	@make get-swig -i
	@mkdir -p views/css
	@node_modules/.bin/lessc --yui-compress --include-path=views/less views/less/swig.less views/css/swig.css
	@node_modules/.bin/still views -o ${tmp} -i "layouts" -i "json" -i "less"
	@cp -R views/js/swig.* ${tmp}/js/
	@cp views/js/lib/zepto.min.js ${tmp}/js/lib
	@git checkout ${branch}
	@cp -r ${tmp}/* ./
	@rm -rf ${tmp}
	@git add .
	@git commit -n -am "Automated build from ${SHA}"
	@git push ${remote} ${branch}
	@git checkout ${THIS_BRANCH}

port = 3000
run:
	@node_modules/.bin/still-server views/ -p ${port} -o

lint:
	@echo '0 errors'

test:
	@echo ''

.PHONY: all, clean, get_swig, build, lint, test
