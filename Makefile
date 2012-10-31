all:
	@npm install

out = 'tmp_build'
clean:
	@rm -rf ${out}

SHA := $(shell git rev-parse HEAD)
THIS_BRANCH := $(shell git branch)
branch = gh-pages
build: clean
	@node_modules/.bin/still ./ -o ${out} -i "node_modules" -i "README" -i ".git" -i "package.json" -i "Makefile"
	@git checkout ${branch}
	@cp ${out}/* ./
	@rm -rf ${out}
	# @git commit -n -am "Automated build from ${SHA}"
	# @git checkout ${THIS_BRANCH}

port = 3000
run:
	@node_modules/.bin/still-server ./ -p ${port} -o

lint:
	@echo ''

test:
	@echo ''

.PHONY: all, test, line
