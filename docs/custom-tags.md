# Writing Custom Tags

Swig makes it easy to write custom tags specific for your project.

First, make sure to include your node.js file that declares your tags in the swig init:

    swig.init({ tags: require('mytags') });

## Requirements

First, include the Swig parser and helpers.

    var parser  = require('swig/lib/parser'),
        helpers = require('swig/lib/helpers');

Define your tag and whether or not it requires an "end" tag:

    exports.mytag = function (indent) {
        return 'output';
    };
    exports.mytag.ends = true;

## A Really Simple Tag

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

        output.push('<h1>');
        output.push('__output.push(__myArg)');
        output.push('</h1>');
        output.push('<p>');
        output.push(parser.compile.call(this, indent + '    '));
        output.push('</p>');

        return output.join('\n' + indent);
    };
    exports.mytag.ends = true;

When using your tag, it might have the following effect (assume `blah` is equal to "Scrumdiddlyumptious"):

Template:

    {% mytag blah %}Tacos{% endmytag %}

Output:

    <h1>Scrumdiddlyumptious</h1>
    <p>Tacos</p>

## Write Your Own

To best understand how to write your own tag, reference [`swig/lib/tags.js`](../lib/tags.js) to see how the internal tags are written. These will give you a pretty clear indication of how to write your own.
