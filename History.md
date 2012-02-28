[0.11.0](https://github.com/paularmstrong/swig/tree/v0.11.0) / 2012-02-27
------------------------------------------------------------------------

* **Added** Support for Windows style paths [gh-57]
* **Added** `ignore missing` tokens to include tag
* **Changed** include tag `with context` to only work if `context` is an object
* **Changed** `autoescape` tag controls no longer 'yes' or 'no'. Use `true` and `false`
* **Changed** parser is now passed into tags as an argument
* **Changed** don't require passing context object when rendering template
* **Fixed** dateformats `N` and `w` [gh-59]
* **Fixed** number changing to string after add filter or set from variable [gh-53] [gh-58]
* **Fixed** speed decrease caused by loop.cycle fixed
* **Fixed** Ensure set tag bubbles through extends and blocks

[Documentation](https://github.com/paularmstrong/swig/tree/v0.11.0/docs)

[0.10.0](https://github.com/paularmstrong/swig/tree/v0.10.0) / 2012-02-13
------------------------------------------------------------------------

* **Added** loop.index0, loop.revindex, loop.revindex0, and loop.cycle [gh-48]
* **Added** init config `extensions` for 3rd party extension access in custom tags [gh-44]
* **Added** Whitespace Control [gh-46]
* **Changed** The `empty` tag in `for` loops is now `else` [gh-49]
* **Changed** `forloop` vars to `loop` closes [gh-47]
* **Fixed** `include` tag's `with` and `only` args documentation [gh-50]

[Documentation](https://github.com/paularmstrong/swig/tree/v0.10.0/docs)

[0.9.4](https://github.com/paularmstrong/swig/tree/v0.9.4) / 2012-02-07
-----------------------------------------------------------------------

* **Fixed** `parent` tag would not render when called within tags [gh-41]
* **Fixed** Documentation for forloop.index & forloop.key [gh-42]
* **Fixed** Errors when using `include` inside base template `block` tags [gh-43]
* **Fixed** Allow `set` tag to set values to numbers [gh-45]
* **Fixed** `set` tag for booleans using too many checks

[Documentation](https://github.com/paularmstrong/swig/tree/v0.9.4/docs)

[0.9.3](https://github.com/paularmstrong/swig/tree/v0.9.3) / 2012-01-28
-----------------------------------------------------------------------

* **Fixed** Allow object and array values to be accessed via context variables [gh-40]

[Documentation](https://github.com/paularmstrong/swig/tree/v0.9.3/docs)

[0.9.2](https://github.com/paularmstrong/swig/tree/v0.9.2) / 2012-01-23
-----------------------------------------------------------------------

* **Fixed** Correctly reset autoescape after closing an autoescape tag. [gh-39]

[Documentation](https://github.com/paularmstrong/swig/tree/v0.9.2/docs)

[0.9.1](https://github.com/paularmstrong/swig/tree/v0.9.1) / 2012-01-18
-----------------------------------------------------------------------

* **Fixed** Allow multi-line tags and comments. [gh-30]

[Documentation](https://github.com/paularmstrong/swig/tree/v0.9.1/docs)

[0.9.0](https://github.com/paularmstrong/swig/tree/v0.9.0) / 2011-12-30
-----------------------------------------------------------------------

* **Added** DateZ license to browser header, use link to underscore license.
* **Added** Timezone support in `date` filter [gh-27].
* **Added** New `raw` tag.
* **Changed** Swig is no longer node 0.4 compatible.
* **Fixed** Filter `date('f')` for 10am times.
* **Fixed** Filter `date('r')` returns in UTC date format. This is more correct tospec RFC2822, per [php.net/date](http://php.net/date).
* **Fixed** Filter `add` when adding numbers/numbers+strings together.
* **Fixed** Tests for error messages that changed in node >0.6.0.

[Documentation](https://github.com/paularmstrong/swig/tree/v0.9.0/docs)

[0.8.0](https://github.com/paularmstrong/swig/tree/v0.8.0) / 2011-11-04
-----------------------------------------------------------------------

* **Added** date filter formats `z`, `W`, `t`, `L`, `o`, `B`, and `c`.
* **Added** New `filter` tag.
* **Added** Node.js compatible 0.4.1 - 0.6.X
* **Added** Allow setting cache globally or per-template.
* **Changed** Removed `swig.render` and `swig.fromString`.
* **Changed** `swig.fromFile` is now `swig.compileFile`.
* **Changed** `swig.init()` will clear template cache.
* **Changed** `swig.init()` is now optional for browser mode with no custom settings.
* **Changed** Development dependencies are be more lenient.
* **Fixed** Parser will properly preserver '\' escaping. [gh-24]
* **Fixed** Rewrote tag argument parsing for proper space handling.
* **Fixed** Rewrote filter argument parsing. [gh-23]
* **Fixed** Allow pipe `|` characters in filter arguments. [gh-22]

[Documentation](https://github.com/paularmstrong/swig/tree/v0.8.0/docs)

[0.7.0](https://github.com/paularmstrong/swig/tree/v0.7.0) / 2011-10-05
-----------------------------------------------------------------------

* **Added** `make browser` will build Swig for use in major browsers. [gh-3]
* **Changed** Allow overriding `escape` filters. [gh-19]

[Documentation](https://github.com/paularmstrong/swig/tree/v0.7.0/docs)

[0.6.1](https://github.com/paularmstrong/swig/tree/v0.6.1) / 2011-10-02
-----------------------------------------------------------------------

* **Fixed** chaining filters when the first takes a variable as an argument will not crash parsing.

[Documentation](https://github.com/paularmstrong/swig/tree/v0.6.1/docs)

[0.6.0](https://github.com/paularmstrong/swig/tree/v0.6.0) / 2011-10-02
-----------------------------------------------------------------------

* **Added** `{% import foo as bar %}` tag for importing macros.
* **Added** Allow escaping for js in escape filter and autoescape tag.
* **Added** `raw` filter to force variable to not be escaped.
* **Added** `escape` and `e` filters to force variable to be escaped.
* **Added** Allow filters to accept any JS objects, arrays, strings, and context variables.
* **Changed** `if`, `else`, and `else if` tags support all JS-valid if-syntaxes + extra operators.
* **Fixed** `default` filter for undefined variables. closes gh-18

[Documentation](https://github.com/paularmstrong/swig/tree/v0.6.0/docs)

[0.5.0](https://github.com/paularmstrong/swig/tree/v0.5.0) / 2011-09-27
-----------------------------------------------------------------------

* **Added** More error messaging in some edge cases.
* **Added** Better error messaging including context and line numbers.
* **Changed** Improved compile and render speeds.
* **Changed** `include` tags accept context variables instead of just strings.
* **Changed** Templates can be compiled and rendered from an absolute path outside of the template root.
* **Fixed** Will not double escape output.

[Documentation](https://github.com/paularmstrong/swig/tree/v0.5.0/docs)

[0.4.0](https://github.com/paularmstrong/swig/tree/v0.4.0) / 2011-09-24
-----------------------------------------------------------------------

* **Added** Macro support [docs](docs/tags.md)
* **Changed** Removed requirement to manually specify `locals` for express support.
* **Changed** Increased cache lookup speed by removing crypto dependency.
* **Fixed** `length` filter returns length of objects (number of keys).
* **Fixed** Filters return empty string unless they can apply to the given object.
* **Fixed** Filters will attempt to apply to all values in an object or array.

[Documentation](https://github.com/paularmstrong/swig/tree/v0.4.0/docs)

[0.3.0](https://github.com/paularmstrong/swig/tree/v0.3.0) / 2011-09-17
-----------------------------------------------------------------------

* **Added** Support for `{% set ... %}` tag.

[Documentation](https://github.com/paularmstrong/swig/tree/v0.3.0/docs)

[0.2.3](https://github.com/paularmstrong/swig/tree/v0.2.3) / 2011-09-16
-----------------------------------------------------------------------

* **Fixed** Critical fix for negations in `if` blocks.
* **Added** Support for `forloop.first` in `for` blocks.
* **Added** Support for `forloop.last` in `for` blocks.
* **Added** Support for `forloop.key` in `for` blocks.
* **Added** Support for `{% empty %}` in `for` blocks.

[Documentation](https://github.com/paularmstrong/swig/tree/v0.2.3/docs)

[0.2.2](https://github.com/paularmstrong/swig/tree/v0.2.2) / 2011-09-16
-----------------------------------------------------------------------

* **Added** Support for `else if ...` within `if` blocks.

[Documentation](https://github.com/paularmstrong/swig/tree/v0.2.2/docs)

[0.2.1](https://github.com/paularmstrong/swig/tree/v0.2.1) / 2011-09-13
-----------------------------------------------------------------------

* **Added** Support for `else` within `if` blocks.

[Documentation](https://github.com/paularmstrong/swig/tree/v0.2.1/docs)

[0.2.0](https://github.com/paularmstrong/swig/tree/v0.2.0) / 2011-09-11
-----------------------------------------------------------------------

* **Fixed** `if` statements allow filters applied to operands.
* **Fixed** `for` loops allow filters applied to the object that will be iterated over.

[Documentation](https://github.com/paularmstrong/swig/tree/v0.2.0/docs)

[0.1.9](https://github.com/paularmstrong/swig/tree/v0.1.9) / 2011-09-11
-----------------------------------------------------------------------

* **Added** `allowErrors` flag will allow errors to be thrown and bubbled up. Default to catch errors.
* **Changed** Internal speed improvements.

[Documentation](https://github.com/paularmstrong/swig/tree/v0.1.9/docs)

[0.1.8](https://github.com/paularmstrong/swig/tree/v0.1.8) / 2011-09-10
-----------------------------------------------------------------------

* **Added** `add`, `addslashes`, and `replace` filters.
* **Changed** All tags that 'end' must use named ends like `endblock`, `endif`, `endfor`, etc...

[Documentation](https://github.com/paularmstrong/swig/tree/v0.1.8/docs)

[0.1.7](https://github.com/paularmstrong/swig/tree/v0.1.7) / 2011-09-05
-----------------------------------------------------------------------

* **Added** this History document
* **Fixed** date filter to zero-pad correctly during september when using 'm' format

[Documentation](https://github.com/paularmstrong/swig/tree/v0.1.7/docs)

[0.1.6](https://github.com/paularmstrong/swig/tree/v0.1.6) / 2011-09-04
-----------------------------------------------------------------------

* **Fixed** Template inheritance blocks messing up.

[Documentation](https://github.com/paularmstrong/swig/tree/v0.1.6/docs)

[0.1.5](https://github.com/paularmstrong/swig/tree/v0.1.5) / 2011-09-04
-----------------------------------------------------------------------

* **Added** `first`, `last`, and `uniq` filters
* **Added** ability to specify custom filters
* **Added** ability to specify custom tags
* **Changed** slots removed -- implement using custom tags if desired
* **Fixed** ability to do either dot- or bracket-notation or mixed in variables
* **Fixed** internal parsing helpers

[Documentation](https://github.com/paularmstrong/swig/tree/v0.1.5/docs)

[0.1.3](https://github.com/paularmstrong/swig/tree/v0.1.3) / 2011-09-01
-----------------------------------------------------------------------

* **Fixed** filter parser to work correctly with single-quoted params in filters.

[Documentation](https://github.com/paularmstrong/swig/tree/v0.1.3/docs)

[0.1.2](https://github.com/paularmstrong/swig/tree/v0.1.2) / 2011-09-01
-----------------------------------------------------------------------

* Initial **swig** publish after forking from [node-t](https://github.com/skid/node-t)

[Documentation](https://github.com/paularmstrong/swig/tree/v0.1.2/docs)
