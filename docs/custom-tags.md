Custom Tags <a name="custom-tags" href="#custom-tags">#</a>
===========

Swig makes it easy to write custom tags specific for your project.

First, make sure to include your node.js file that declares your tags in the swig init:

    swig.init({ tags: require('mytags') });

Requirements <a name="requirements" href="#requirements">#</a>
------------

First, include the helpers.

    var helpers = require('swig/lib/helpers');

Define your tag and whether or not it requires an "end" tag:

    exports.mytag = function (indent, parser) {
        return 'output';
    };
    exports.mytag.ends = true;

A Really Simple Tag <a name="example" href="#example">#</a>
-------------------

To parse a swig variable with or without filters into a variable token, eg. `bar` or `foo|lowercase`

    exports.mytag = function (indent, parser) {
        var myArg = parser.parseVariable(this.args[0]);
        return 'output';
    };
    exports.mytag.ends = true;

Use a parsed variable token with `helpers.setVar()` to bind a variable in your current scope into the templates scope. The `setVar` method cleans up variable output, applies filters and escaping for clean output:

    exports.mytag = function (indent, parser) {
        var myArg = parser.parseVariable(this.args[0]),
            output = '';
        output += helpers.setVar(name, myArg);
        return output;
    };
    exports.mytag.ends = true;

To parse the inner content of a tag for outputting, use `parser.compile.apply(this, [indent, parentBlock])`:

    exports.mytag = function (indent, parser) {
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

To access a third-party library or method that is defined outside of your templates, you can add it to swig as an extention. For example, if you are using the i18next node module, add it as an extension when you initialize swig:

    var i18next = require('i18next');
    swig.init({
        extensions: {
            i18next: i18next
        }
    });

Once you've added it, your custom tag can reference the `i18next` extension via the `_ext` object:

    exports.trans = function (indent, parser) {
        var myArg = parser.parseVariable(this.args[0]),
        output = [];
        output.push(helpers.setVar('__myArg', myArg));

        output.push('_output += _ext.i18next.t(__myArg);');

        return output.join('');
    };

Write Your Own <a name="write-your-own" href="#write-your-own">#</a>
--------------

To best understand how to write your own tag, reference [`swig/lib/tags.js`](../lib/tags.js) to see how the internal tags are written. These will give you a pretty clear indication of how to write your own.
