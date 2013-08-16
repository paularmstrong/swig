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
