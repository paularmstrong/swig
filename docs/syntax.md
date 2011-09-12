# Template Syntax

Swig uses the same template syntax as Django Templates

* `{{` opens variable
* `}}` closes the variable

* `{#` opens a comment block
* `#}` closes a comment block

* `{%` opens the start of a logic tag
* `%}` closes a logic tag

## Variables

Used to print a variable to the template. If the variable is not in the context we don't get an error, rather an empty string. You can use dot notation to access object proerties or array memebers.

    <p>First Name: {{ users.0.first_name }}</p>

Variables also are able to be transformed via [filters](filters.md).

## Comments

Comment tags are simply ignored. Comments can't span multitple lines.

    {# This is a comment #}

## Logic

Logic tags are operational blocks that have internal logic on how the template should proceed. Read more about [tags](tags.md).

    {% if something %}
        This will display if something is truthy.
    {% endif %}
