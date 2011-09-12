# Variable tags

Used to print a variable to the template. If the variable is not in the context we don't get an error, rather an empty string. You can use dot notation to access object proerties or array memebers.

    <p>First Name: {{users.0.first_name}}</p>

# Comment tags

Comment tags are simply ignored. Comments can't span multitple lines.

    {# This is a comment #}

# Logic tags

## extends

Makes the current template extend a parent template. This tag must be the first item in your template.

See [Template inheritance](inheritance.md) for more information.

## block

Defines a block in a template that can be overridden by a template extending this one and/or will override the current template's parent template block of the same name.

See [Template inheritance](inheritance.md) for more information.

## parent

Inject the content from the current `block` in the parent template into the child template.

See [Template inheritance](inheritance.md) for more information.

## include

Includes a template in it's place. The template is rendered within the current context. Does not use and {% endinclude %}.

    {% include template_path %}
    {% include "path/to/template.js" %}

## for

You can iterate arrays and objects. Access the current iteration index through 'forloop.index' which is available inside the loop.

    {% for x in y %}
        <p>{% forloop.index %}</p>
    {% endfor %}

You can also apply filters to the object that you are iterating over.

    {% for x in y|reverse %}
        The array `y` will first be reversed before looping over it.
    {% endfor %}

## if

Supports the following expressions. No else tag yet.

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

## autoescape

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
