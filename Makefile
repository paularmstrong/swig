all:
	@npm install

out = 'tmp_build'
clean:
	@rm -rf ${out}

SHA := $(shell git rev-parse HEAD)
THIS_BRANCH := $(shell git branch)
branch = gh-pages
build: clean
	@node_modules/.bin/still views -o ${out} -i "layouts"
	@git checkout ${branch}
	@cp ${out}/* ./
	@rm -rf ${out}
	@git commit -n -am "Automated build from ${SHA}"
	@git checkout ${THIS_BRANCH}

port = 3000
run:
	@node_modules/.bin/still-server views/ -p ${port} -o

lint:
	@echo '0 errors'

test:
	@echo ''

.PHONY: all, test, line
