Custom Tags <a name="custom-tags" href="#custom-tags">#</a>
===========

Swig makes it easy to write custom tags specific for your project.

First, make sure to include your node.js file that declares your tags in the swig init:

    swig.init({ tags: require('mytags') });

Requirements <a name="requirements" href="#requirements">#</a>
------------

First, include the Swig parser and helpers.

    var parser  = require('swig/lib/parser'),
        helpers = require('swig/lib/helpers');

Define your tag and whether or not it requires an "end" tag:

    exports.mytag = function (indent) {
        return 'output';
    };
    exports.mytag.ends = true;

A Really Simple Tag <a name="example" href="#example">#</a>
-------------------

To parse a swig variable with or without filters into a variable token, eg. `bar` or `foo|lowercase`

    exports.mytag = function (indent) {
        var myArg = parser.parseVariable(this.args[0]);
        return 'output';
    };
    exports.mytag.ends = true;

Use a parsed variable token with `helpers.setVar()` to bind a variable in your current scope into the templates scope. The `setVar` method cleans up variable output, applies filters and escaping for clean output:

    exports.mytag = function (indent) {
        var myArg = parser.parseVariable(this.args[0]),
            output = '';
        output += helpers.setVar(name, myArg);
        return output;
    };
    exports.mytag.ends = true;

To parse the inner content of a tag for outputting, use `parser.compile.call(this, indent)`:

    exports.mytag = function (indent) {
        var myArg = parser.parseVariable(this.args[0]),
            output = [];

        output.push(helpers.setVar('__myArg', myArg));

        output.push('_output += "<h1>";');
        output.push('_output += __myArg;');
        output.push('_output += "</h1>";');
        output.push('_output += "<p>";');
        output.push(parser.compile.call(this, indent + '    '));
        output.push('_output += "</p>";');

        return output.join('');
    };
    exports.mytag.ends = true;

When using your tag, it might have the following effect (assume `blah` is equal to "Scrumdiddlyumptious"):

Template:

    {% mytag blah %}Tacos{% endmytag %}

Output:

    <h1>Scrumdiddlyumptious</h1>
    <p>Tacos</p>

Third-Party Extensions <a name="third-party-extensions" href="#third-party-extensions">#</a>
----------------------

Often times, you'll want to import a third-party javascript extension into your custom tags. For example, if you have a custom tag that compiles some instructions to access library `i18n` like so:

    exports.trans = function (indent) {
        var myArg = parser.parseVariable(this.args[0]),
        output = [];
        output.push(helpers.setVar('__myArg', myArg));

        output.push('_output += i18n(__myArg);');

        return output.join('');
    };

You'll quickly notice that the compiled templates don't have access to the `i18n` module. To allow access, the `swig.init` method takes an `extensions` config:

    var i18n = require('i18n');
    swig.init({
        extensions: {
            i18n: i18n
        }
    });

Write Your Own <a name="write-your-own" href="#write-your-own">#</a>
--------------

To best understand how to write your own tag, reference [`swig/lib/tags.js`](../lib/tags.js) to see how the internal tags are written. These will give you a pretty clear indication of how to write your own.
