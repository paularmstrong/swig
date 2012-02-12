Template Syntax <a name="syntax" href="#syntax">#</a>
===============

* [Variables](#variables)
* [Comments](#comments)
* [Logic](#logic)
* [Whitespace Control](#whitespace)

Swig uses the same template syntax as Django Templates

* `{{` opens variable
* `}}` closes the variable

* `{#` opens a comment block
* `#}` closes a comment block

* `{%` opens the start of a logic tag
* `%}` closes a logic tag

Variables <a name="variables" href="#variables">#</a>
---------

Used to print a variable to the template. If the variable is not in the context we don't get an error, rather an empty string. You can use dot notation to access object properties or array memebers.

    <h1>{{ title }}</h1>
    First Name: {{ users[0].first_name }}

You can also use in-context variables as keys on arrays and objects:
Assume context to the template is `{ users: ['Paul', 'Jim', 'Jane'], key: 2 }`

    {{ users[key] }}

Variables also are able to be transformed via [filters](filters.md).

By default, all variables will be escaped for safe HTML output. For more information, read about the [escape filter](filters.md#escape).

Comments <a name="comments" href="#domments">#</a>
--------

Comment tags are simply ignored by the parser. They will removed before your templates are rendered so that no one can see them unless they have access to your source code.

    {# This is a comment #}

Logic <a name="logic" href="#logic">#</a>
-----

Logic tags are operational blocks that have internal logic on how the template should proceed. Read more about [tags](tags.md).

    {% if something %}
        This will display if something is truthy.
    {% endif %}

### Whitespace Control <a name="whitespace" href="#whitespace">#</a>

Any whitespace in your templates is left in your final output templates. However, you can control the whitespace around logic tags by using whitespace controls. If you put a dash (`-`) at the beginning or end of you tag, it will remove the previous or following whitespace.

    {% for item in seq -%}
        {{ item }}
    {%- endfor %}

This will return all `item` objects without any whitespace between them. If `seq` is an array of number `1` through `5`, the output will be `12345`.
