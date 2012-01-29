Template Syntax <a name="syntax" href="#syntax">#</a>
===============

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
