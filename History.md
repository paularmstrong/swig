## [0.2.2](https://github.com/paularmstrong/swig/tree/0.2.2) / 2011-09-16

* **Added** Support for `else if ...` within `if` blocks.

## [0.2.1](https://github.com/paularmstrong/swig/tree/0.2.1) / 2011-09-13

* **Added** Support for `else` within `if` blocks.

## [0.2.0](https://github.com/paularmstrong/swig/tree/0.2.0) / 2011-09-11

* **Fixed** `if` statements allow filters applied to operands.
* **Fixed** `for` loops allow filters applied to the object that will be iterated over.

## [0.1.9](https://github.com/paularmstrong/swig/tree/0.1.9) / 2011-09-11

* **Added** `allowErrors` flag will allow errors to be thrown and bubbled up. Default to catch errors.
* **Changed** Internal speed improvements.

## [0.1.8](https://github.com/paularmstrong/swig/tree/0.1.8) / 2011-09-10

* **Added** `add`, `addslashes`, and `replace` filters.
* **Changed** All tags that 'end' must use named ends like `endblock`, `endif`, `endfor`, etc...

## [0.1.7](https://github.com/paularmstrong/swig/tree/0.1.7) / 2011-09-05

* **Added** this History document
* **Fixed** date filter to zero-pad correctly during september when using 'm' format

## [0.1.6](https://github.com/paularmstrong/swig/tree/0.1.6) / 2011-09-04

* **Fixed** Template inheritance blocks messing up.

## [0.1.5](https://github.com/paularmstrong/swig/tree/0.1.5) / 2011-09-04

* **Added** `first`, `last`, and `uniq` filters
* **Added** ability to specify custom filters
* **Added** ability to specify custom tags
* **Changed** slots removed -- implement using custom tags if desired
* **Fixed** ability to do either dot- or bracket-notation or mixed in variables
* **Fixed** internal parsing helpers

## [0.1.3](https://github.com/paularmstrong/swig/tree/0.1.3) / 2011-09-01

* **Fixed** filter parser to work correctly with single-quoted params in filters.

## [0.1.2](https://github.com/paularmstrong/swig/tree/0.1.2) / 2011-09-01

* Initial **swig** publish after forking from [node-t](https://github.com/skid/node-t)
