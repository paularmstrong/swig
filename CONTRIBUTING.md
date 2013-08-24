Contributing
============

Contributions are awesome! However, Swig is held to very high coding standards, so to ensure that your pull request is easy to understand and will be more successful, please follow this checklist:

Checklist
---------

1. **Setup:** Before you begin, run `make` from your command line to ensure all dependencies are met.
2. **Test:** Always write new test cases. `make test` and `make test-browser`.
3. **Lint:** Ensure coding-standards are followed. `make lint`.
4. **Explain:** In your pull request, very clearly explain the use-case or problem that you are solving.

_Pull requests that fail to add test coverage, break tests, or fail linting standards will not be accepted._

The swig codebase is [highly tested](http://paularmstrong.github.io/swig/coverage.html) and linted, as a way to guarantee functionality and keep all code written in a particular style for readability. No contributions will be accepted that do not pass all tests or throw any linter errors.

Here's an example of a great pull request that followed the above checklist: [Pull Request 273 - Added patch and test case for object prototypal inheritance](https://github.com/paularmstrong/swig/pull/273).

Documentation
-------------

All documentation for Swig is generated from [JSDoc](http://usejsdoc.org) comments inline and Swig template files within the `./docs` folder. To make changes to any documentation, follow these steps and tips:

```sh
# Clone the repo
$ git clone git@github.com:paularmstrong/swig.git
$ cd swig
```

```sh
# Get dependencies
$ make
```

```sh
# Ensure your $NODE_PATH is set
# Place this in your ~/.bash_profile
export NODE_PATH=$(npm -g root 2>/dev/null)
```

```sh
# Run the documentation test environment
$ make docs
```

* Once you have the documentation test environment running, your browser will open showing you the documentation site.
* If you are making changes to HTML files in `./docs`, reload the page to see them reflected immediately.
* If you are changing any content from the inline [JSDoc](http://usejsdoc.org) comments, run `make build-docs` to rebuild the JSON data files.

### Important!

Once your documentation pull request is accepted, the person merging your request will be responsible for pushing the changes to the live site. Any attempts to push to or run a pull request to the `gh-pages` branch will not be accepted.

Build Tasks
-----------

### make

Installs all dependencies and sets up sanity-check git hooks.

### make build

Builds the browser-ified version of Swig to `./dist`.

### make test

Runs all test files matching `./test/*.test.js` within node.js.

### make test-browser

Builds for browser and runs a large subset of tests from the `make test` task within a browser environment using Phantom.js.

### make coverage

Builds a test coverage report.

### make docs

Builds documentation and runs a web-server for viewing a preview of the documentation site.

### make build-docs

Builds documentation for `docs` and `gh-pages` tasks from jsdoc comments in `./lib`.

### make gh-pages

Builds documentation as static HTML files and pushes them to the `gh-pages` git branch.

### make version

Updates the package version number throughout the source files from the `version` key found in `package.json`.
