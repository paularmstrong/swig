# Tags

## Built-in Tags

### extends

Makes the current template extend a parent template. This tag must be the first item in your template.

See [Template inheritance](inheritance.md) for more information.

### block

Defines a block in a template that can be overridden by a template extending this one and/or will override the current template's parent template block of the same name.

See [Template inheritance](inheritance.md) for more information.

### parent

Inject the content from the current `block` in the parent template into the child template.

See [Template inheritance](inheritance.md) for more information.

### include

Includes a template in it's place. The template is rendered within the current context. Does not use and {% endinclude %}.

    {% include template_path %}
    {% include "path/to/template.js" %}

### for

For loops have 4 special context variables accessible inside of the loop:

    {% for x in y %}
        {% if forloop.first %}<ul>{% endif %}
        <li>{% forloop.index %} - {% forloop.key %}: {{ x }}</li>
        {% if forloop.last %}</ul>{% endif %}
    {% endfor %}

* `forloop.index`: the zero-indexed spot in the iterator.
* `forloop.key`: if the iterator is an object, this will be the key of the current item, otherwise it will be the same as the `forloop.index`.
* `forloop.first`: `true` if the current object is the first in the object or array.
* `forloop.last`: `true` if the current object is the last in the object or array.

You can also apply filters to the object that you are iterating over.

    {% for x in y|reverse %}
        The array `y` will first be reversed before looping over it.
    {% endfor %}

#### empty

For loops have a special tag available to them called `{% empty %}`.

If the loop object is empty or `length === 0`, the content following the `empty` tag will be rendered.

    {% for person in people %}
        {{ person }}
    {% empty %}
        There are no people yet!
    {% endfor %}

### if

Supports the following expressions.

    {% if x %}{% endif %}
    {% if !x %}{% endif %}
    {% if x operator y %}
        Operators: ==, !=, <, <=, >, >=, ===, !==, in
        The 'in' operator checks for presence in arrays too.
    {% endif %}
    {% if x == 'five' %}
        The operands can be also be string or number literals
    {% endif %}
    {% if x|length === 3 %}
        You can use filters on any operand in the statement.
    {% endif %}

#### else and else if

Also supports using the `{% else %}` and `{% else if ... %}` tags within an if-block. Using `{% else [if ...] %}` anywhere outside an immediate parent if-block will throw an exception.

    {% if foo %}
        Some content.
    {% else if "foo" in bar %}
        Content if the array `bar` has "foo" in it.
    {% else %}
        Fallback content.
    {% endif %}

### autoescape

The `autoescape` tag accepts one of two controls: `on` or `off` (default is `on` if not provided). These either turn variable auto-escaping on or off for the contents of the filter, regardless of the global setting.

For the following contexts, assume:

    some_html_output = '<p>Hello "you" & \'them\'</p>';

So the following:

    {% autoescape off %}
        {{ some_html_output }}
    {% endautoescape %}

    {% autoescape on %}
        {{ some_html_output }}
    {% endautoescape %}

Will output:

    <p>Hello "you" & 'them'</p>

    &lt;p&gt;Hello &quot;you&quot; &amp; &#39;them&#39; &lt;/p&gt;


## Writing Custom Tags

Swig makes it easy to write custom tags specific for your project.

First, make sure to include your node.js file that declares your tags in the swig init:

    swig.init({ tags: require('./mytags.js') });

Each tag will be executed with its scope bound to the tag token object. A token for a tag will look like this:

    // Assume your template has {% mytag foo bar %}{% endmytag %}
    var token = {
        type: LOGIC_TOKEN,      // Used internally by the parser. It will always be the same, no matter what tag.
        name: 'mytag',
        args: ['foo', 'bar'],
        compile: tag_function
    };

Now you can write a tag called `mytag` that returns a bit of JavaScript logic to have run while rendering your template. For more information on how to write a tag, view the [tags.js source file](../lib/tags.js).
