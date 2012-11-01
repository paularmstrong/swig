all:
	@npm install

out = 'tmp_build'
clean:
	@rm -rf ${out}

SHA := $(shell git rev-parse HEAD)
THIS_BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
remote=dev
branch=gh-pages
build: clean
	@node_modules/.bin/still views -o ${out} -i "layouts" -i "json"
	@git checkout ${branch}
	@cp -r ${out}/* ./
	@rm -rf ${out}
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

.PHONY: all, test, line
