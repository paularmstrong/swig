# Writing Custom Tags

Swig makes it easy to write custom tags specific for your project.

First, make sure to include your node.js file that declares your tags in the swig init:

    swig.init({ tags: require('mytags') });

Each tag will be executed with its scope bound to the tag token object. A token for a tag will look like this:

    // Assume your template has {% mytag foo bar %}{% endmytag %}
    var token = {
        type: LOGIC_TOKEN,      // Used internally by the parser. It will always be the same, no matter what tag.
        name: 'mytag',
        args: ['foo', 'bar'],
        compile: tag_function
    };

## Requirements

First, include the Swig parser and helpers.

    var parser  = require('swig/lib/parser'),
        helpers = require('swig/lib/helpers');

## Useful Methods

To bind a variable in your current scope into the templates scope:

    helpers.setVar(name, value);

To parse a swig variable with or without filters, eg. `bar` or `foo|lowercase`

    var myArg = parser.parseVariable(this.args[0]);