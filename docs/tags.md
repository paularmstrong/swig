Tags <a name="tags" href="#tags">#</a>
====

Built-in Tags <a name="builtin" href="#builtin">#</a>
-------------

* [extends](#extends)
* [block](#block)
* [parent](#parent)
* [include](#include)
* [raw](#raw)
* [for](#for) - [else](#forelese)
* [if](#if) - [else (if)](#else)
* [autoescape](#autoescape)
* [macro](#macro)
* [import](#import)
* [filter](#filter)

### extends <a name="extends" href="#extends">#</a>

Makes the current template extend a parent template. This tag must be the first item in your template.

See [Template inheritance](inheritance.md) for more information.

### block <a name="block" href="#block">#</a>

Defines a block in a template that can be overridden by a template extending this one and/or will override the current template's parent template block of the same name.

See [Template inheritance](inheritance.md) for more information.

### parent <a name="parent" href="#parent">#</a>

Inject the content from the current `block` in the parent template into the child template.

See [Template inheritance](inheritance.md) for more information.

### include <a name="include" href="#include">#</a>

Includes a template in it's place. The template is rendered within the current context. Does not use and {% endinclude %}.

    {% include template_path %}
    {% include "path/to/template.js" %}

#### Including Context

Locally declared context variables are _not_ passed to the included template by default. For example, in the following situations, your `inc.html` will not know about the variables `foo` nor `bar`:

    {% set foo = "bar" %}
    {% include "inc.html" %}

    {% for bar in thing %}
        {% include "inc.html" %}
    {% endfor %}

In order to have your included template get these locally declared variables, you can use the `with` argument, followed by space-separated tokens of the local variables to include in the context:

    {% set foo = "bar" %}
    {% include "inc.html" with foo %}

    {% for bar in thing %}
        {% include "inc.html" with foo bar %}
    {% endfor %}

You can also use the `only` argument to restrict the context to the variables that you explicitly define.

Assume that your current context has variables `bar` and `foo` available. In the following situation, only `foo` will be defined in your `inc.html`:

    {% include "inc.html" with foo only %}

The `only` argument _must_ be passed as the last argument in the tag. Any other placement will not work.

#### Replacing Context

You can also choose to replace the include's context with another context using the `using` argument. This might be common in child templates that can be rendered standalone.

    {% for bar in thing %}
        {% include "inc.html" using bar %}
    {% endfor %}

In this example, `inc.html` will now have `bar` as its context.

You can only pass in one replacement context and it should be an object.

### raw <a name="raw" href="#raw">#</a>

Wrap any section in `{% raw %}...{% endraw %}` to stop the token parser from modifying any of the internal content. Also useful for putting swig templates into JavaScript for swig in the browser. Attempting to do the following without this tag will cause a parsing error and your template will not be displayed.

    You can output any content, including swig tag modifiers like {% raw %}<code>{{</code> and <code>{%</code>{% endraw %} without having them parsed and errors thrown.

### for <a name="for" href="#for">#</a>

For loops have 4 special context variables accessible inside of the loop:

    {% for x in y %}
        {% if loop.first %}<ul>{% endif %}
        <li>{{ loop.index }} - {{ loop.key }}: {{ x }}</li>
        {% if loop.last %}</ul>{% endif %}
    {% endfor %}

* `loop.index`: the current iteration of the loop (1-indexed)
* `loop.index0`: the current iteration of the loop (0-indexed)
* `loop.revindex`: the number of iterations from the end of the loop (1-indexed)
* `loop.revindex0`: the number of iterations from the end of the loop (0-indexed)
* `loop.key`: if the iterator is an object, this will be the key of the current item, otherwise it will be the same as the `loop.index`.
* `loop.first`: `true` if the current object is the first in the object or array.
* `loop.last`: `true` if the current object is the last in the object or array.
* `loop.cycle`: a helper function to cycle between a the given arguments

The `loop.cycle` helper function can take any number of arguments and will cycle through them during each iteration of the loop. A common use-case may look like this:

    {% for item in items %}
        <li class="{{ loop.cycle('odd', 'even') }}">{{ item }}</li>
    {% endfor %}

You can also apply filters to the object that you are iterating over.

    {% for x in y|reverse %}
        The array `y` will first be reversed before looping over it.
    {% endfor %}

#### else <a name="forelse" href="#forelse">#</a>

For loops have a special tag available to them called `{% else %}`.

If the loop object is empty or `length === 0`, the content following the `else` tag will be rendered.

    {% for person in people %}
        {{ person }}
    {% else %}
        There are no people yet!
    {% endfor %}

### if <a name="if" href="#if">#</a>

All normal JavaScript-valid if statements are supported, including some extra helpful syntaxes:

    {% if x %}{% endif %}
    {% if !x %}{% endif %}
    {% if not x %}{% endif %}

    {% if x and y %}{% endif %}
    {% if x && y %}{% endif %}
    {% if x or y %}{% endif %}
    {% if x || y %}{% endif %}
    {% if x || (y && z) %}{% endif %}

    {% if x [operator] y %}
        Operators: ==, !=, <, <=, >, >=, ===, !==
    {% endif %}
    {% if x == 'five' %}
        The operands can be also be string or number literals
    {% endif %}
    {% if x|length === 3 %}
        You can use filters on any operand in the statement.
    {% endif %}

    {% if x in y %}
        If x is a value that is present in y, this will return true.
    {% endif %}

#### else and else if <a name="else" href="#else">#</a>

Also supports using the `{% else %}` and `{% else if ... %}` tags within an if-block. Using `{% else [if ...] %}` anywhere outside an immediate parent if-block will throw an exception.

    {% if foo %}
        Some content.
    {% else if "foo" in bar %}
        Content if the array `bar` has "foo" in it.
    {% else %}
        Fallback content.
    {% endif %}

### autoescape <a name="autoescape" href="#autoescape">#</a>

The `autoescape` tag accepts two controls:

1. `on` or `off`: (default is `on` if not provided). These either turn variable auto-escaping on or off for the contents of the filter, regardless of the global setting.
1. escape-type: optionally include `"js"` to escape variables safe for JavaScript

For the following contexts, assume:

    some_html_output = '<p>Hello "you" & \'them\'</p>';

So the following:

    {% autoescape off %}
        {{ some_html_output }}
    {% endautoescape %}

    {% autoescape on %}
        {{ some_html_output }}
    {% endautoescape %}

    {% autoescape on "js" %}
        {{ some_html_output }}
    {% endautoescape %}

Will output:

    <p>Hello "you" & 'them'</p>

    &lt;p&gt;Hello &quot;you&quot; &amp; &#39;them&#39; &lt;/p&gt;

    \u003Cp\u003EHello \u0022you\u0022 & \u0027them\u0027\u003C\u005Cp\u003E

For more information on how the autoescape tag filters variable output, see the [escape filter documentation](filters.md#escape).

### set <a name="set" href="#set">#</a>

It is also possible to set variables in templates.

    {% set foo = [0, 1, 2, 3, 4, 5] %}
    {% for num in foo %}
        <li>{{ num }}</li>
    {% endfor %}

### macro <a name="macro" href="#macro">#</a>

Macros are custom, reusable methods for content-generation that are defined in templates.

#### Example

One of the most common use-case for macros is form inputs. To start, define your `input` macro somewhere in your template scope (the top of a template, or an included template is a good spot):

    {% macro input type name id label value error %}
        <label for="{{ name }}">{{ label }}</label>
        <input type="{{ type }}" name="{{ name }}" id="{{ id }}" value="{{ value }}"{% if error %} class="error"{% endif %}>
    {% endmacro %}

Somewhere later in your template, invoke the macro using a variable:

    <div>{{ input("text", "fname", "fname", "First Name", fname.value, fname.errors) }}</div>
    <div>{{ input("text", "lname", "lname", "Last Name", lname.value, lname.errors) }}</div>

Your output may look like this:

    <div>
        <label for="fname">First Name</label>
        <input type="text" name="fname" id="fname" value="Paul">
    </div>
    <div>
        <label for="lname">Last Name</label>
        <input type="text" name="lname" id="lname" value="" class="error">
    </div>

### import <a name="import" href="#import">#</a>

The `import` tag is specifically designed for importing macros into your template with a specific context scope. This is very useful for keeping your macros from overriding template context that is being injected by your server-side page generation.

Note that `import` is context-sensitive. If you import a macro in a `for` loop, the imported macro will only be available within that loop. It's best to import macros from your parent template, if possible, otherwise import at the beginning of the block you'll be using it.

#### Usage

Assuming the macro `input` exists in _formmacros.html_, you can run the macro by using `{{ form.input }}` as follows:

    {% import 'formmacros.html' as form %}

    {# this will run the input macro #}
    {{ form.input("text", "name") }}

    {# this, however, will NOT output anything because the macro is scoped to the "form" object: #}
    {{ input("text", "name") }}

### filter <a name="filter" href="#filter">#</a>

The `filter` tag allows you to apply a [filter](filters.md) to all final content within the specified `filter` tag.

#### Example

    {% filter uppercase %}oh hi, {{ name }}{% endfilter %}
    {% filter replace "." "!" "g" %}Hi. My name is Paul.{% endfilter %}

    OH HI, PAUL
    Hi! My name is Paul!


Custom Tags <a name="custom-tags" href="#custom-tags">#</a>
-----------

Swig has support for you to write your own custom tags. For more information, see the [Custom Tags Documentation](custom-tags.md).
