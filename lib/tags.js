/**
 * Control auto-escaping of variable output from within your templates.
 *
 * Examples:
 *
 *      // myvar = '<foo>';
 *      {% autoescape true %}{{ myvar }}{% endautoescape %}
 *      // => &lt;foo&gt;
 *      {% autoescape false %}{{ myvar }}{% endautoescape %}
 *      // => <foo>
 *
 * @param {boolean} control One of `true` or `false`.
 */
exports.autoescape = require('./tags/autoescape');

/**
 * Defines a block in a template that can be overridden by a template extending this one and/or will override the current template's parent template block of the same name.
 *
 * See <a href="#inheritance">Template Inheritance</a> for more information.
 *
 * Examples:
 *
 *      {% block body %}...{% endblock %}
 *
 * @param {literal}  name   Name of the block for use in parent and extended templates.
 */
exports.block = require('./tags/block');

/**
 * Used within an <code data-language="swig">{% if %}</code> tag, the code block following this tag up until <code data-language="swig">{% endif %}</code> will be rendered if the <i>if</i> statement returns false.
 *
 * Examples:
 *
 *      {% if false %}
 *        statement1
 *      {% else %}
 *        statement2
 *      {% endif %}
 *      // => statement2
 *
 */
exports.else = require('./tags/else');

/**
 * Like <code data-language="swig">{% else %}</code>, except this tag can take more conditional statements.
 *
 * Examples:
 *
 *      {% if false %}
 *        Tacos
 *      {% elseif true %}
 *        Burritos
 *      {% else %}
 *        Churros
 *      {% endif %}
 *      // => Burritos
 *
 * @param {...mixed} conditional  Conditional statement that returns a truthy or falsy value.
 */
exports.elseif = require('./tags/elseif');

/**
 * Shortcut for <a href="#elseif"><code data-language="swig">{% elseif ... %}</code></a>.
 */
exports.elif = exports.elseif;

/**
 * Makes the current template extend a parent template. This tag must be the first item in your template.
 *
 * See <a href="#inheritance">Template Inheritance</a> for more information.
 *
 * Examples:
 *
 *      {% extends "./layout.html" %}
 *
 * @param {string} parentFile  Relative path to the file that this template extends.
 */
exports.extends = require('./tags/extends');

/**
 * Apply a filter to an entire block of template.
 *
 * Examples:
 *
 *      {% filter uppercase %}oh hi, {{ name }}{% endfilter %}
 *      // => OH HI, PAUL
 *      {% filter replace(".", "!", "g") %}Hi. My name is Paul.{% endfilter %}
 *      // => Hi! My name is Paul!
 *
 * @param {function} filter  The filter that should be applied to the contents of the tag.
 */
exports.filter = require('./tags/filter');

/**
 * Loop over objects and arrays.
 *
 * Examples:
 *
 *      // obj = { one: 'hi', two: 'bye' };
 *      {% for x in obj %}
 *        {% if loop.first %}<ul>{% endif %}
 *        <li>{{ loop.index }} - {{ loop.key }}: {{ x }}</li>
 *        {% if loop.last %}</ul>{% endif %}
 *      {% endfor %}
 *      // => <ul>
 *      //    <li>1 - one: hi</li>
 *      //    <li>2 - two: bye</li>
 *      //    </ul>
 *
 *      // arr = [1, 2, 3]
 *      // Reverse the array, shortcut the key/index to `key`
 *      {% for key, val in arr|reverse %}
 *      {{ key }} -- {{ val }}
 *      {% endfor %}
 *      // => 0 -- 3
 *      //    1 -- 2
 *      //    2 -- 1
 *
 * @param {literal} [key]     A shortcut to the index of the array or current key accessor.
 * @param {literal} variable  The current value will be assigned to this variable name temporarily. The variable will be reset upon ending the for tag.
 * @param {literal} in        Literally, "in". This token is required.
 * @param {object}  object    An enumerable object that will be iterated over.
 *
 * @return {loop.index} The current iteration of the loop (1-indexed)
 * @return {loop.index0} The current iteration of the loop (0-indexed)
 * @return {loop.revindex} The number of iterations from the end of the loop (1-indexed)
 * @return {loop.revindex0} The number of iterations from the end of the loop (0-indexed)
 * @return {loop.key} If the iterator is an object, this will be the key of the current item, otherwise it will be the same as the loop.index.
 * @return {loop.first} True if the current object is the first in the object or array.
 * @return {loop.last} True if the current object is the last in the object or array.
 */
exports.for = require('./tags/for');

/**
 * Used to create conditional statements in templates. Accepts most JavaScript valid comparisons.
 *
 * Can be used in conjunction with <a href="#elseif"><code data-language="swig">{% elseif ... %}</code></a> and <a href="#else"><code data-language="swig">{% else %}</code></a> tags.
 *
 * Examples:
 *
 *      {% if x %}{% endif %}
 *      {% if !x %}{% endif %}
 *      {% if not x %}{% endif %}
 *
 *      {% if x and y %}{% endif %}
 *      {% if x && y %}{% endif %}
 *      {% if x or y %}{% endif %}
 *      {% if x || y %}{% endif %}
 *      {% if x || (y && z) %}{% endif %}
 *
 *      {% if x [operator] y %}
 *        Operators: ==, !=, <, <=, >, >=, ===, !==
 *      {% endif %}
 *
 *      {% if x == 'five' %}
 *        The operands can be also be string or number literals
 *      {% endif %}
 *
 *      {% if x|lower === 'tacos' %}
 *        You can use filters on any operand in the statement.
 *      {% endif %}
 *
 *      {% if x in y %}
 *        If x is a value that is present in y, this will return true.
 *      {% endif %}
 *
 * @param {...mixed} conditional Conditional statement that returns a truthy or falsy value.
 */
exports.if = require('./tags/if');

/**
 * Allows you to import macros from another file directly into your current context.
 *
 * The import tag is specifically designed for importing macros into your template with a specific context scope. This is very useful for keeping your macros from overriding template context that is being injected by your server-side page generation.
 *
 * Examples:
 *
 *      {% import './formmacros.html' as forms %}
 *      {{ form.input("text", "name") }}
 *      // => <input type="text" name="name">
 *
 *      {% import "../shared/tags.html" as tags %}
 *      {{ tags.stylesheet('global') }}
 *      // => <link rel="stylesheet" href="/global.css">
 *
 * @param {string|var}  file      Relative path from the current template file to the file to import macros from.
 * @param {literal}     as        Literally, "as".
 * @param {literal}     varname   Local-accessible object name to assign the macros to.
 */
exports.import = require('./tags/import');

/**
 * Includes a template partial in place. The template is rendered within the current locals variable context.
 *
 * Examples:
 *
 *      // food = 'burritos';
 *      // drink = 'lemonade';
 *      {% include "./partial.html" %}
 *      // => I like burritos and lemonade.
 *
 *      // my_obj = { food: 'tacos', drink: 'horchata' };
 *      {% include "./partial.html" with my_obj %}
 *      // => I like tacos and horchata.
 *
 * @param {string|var}  file      The path, relative to the template root, to render into the current context.
 * @param {literal}     [with]    Literally, "with".
 * @param {object}      [context] Restrict the local variable context in the file to this key-value object.
 */
exports.include = require('./tags/include');

/**
 * Create custom, reusable snippets within your templates.
 *
 * Can be imported from one template to another using the <a href="#import"><code data-language="swig">{% import ... %}</code></a> tag.
 *
 * Examples:
 *
 *      {% macro input type name id label value error %}
 *        <label for="{{ name }}">{{ label }}</label>
 *        <input type="{{ type }}" name="{{ name }}" id="{{ id }}" value="{{ value }}"{% if error %} class="error"{% endif %}>
 *      {% endmacro %}
 *
 *      {{ input("text", "fname", "fname", "First Name", fname.value, fname.errors) }}
 *      // => <label for="fname">First Name</label>
 *      //    <input type="text" name="fname" id="fname" value="">
 *
 * @param {...arguments} arguments  User-defined arguments.
 */
exports.macro = require('./tags/macro');

/**
 * Inject the content from the parent template's block of the same name into the current block.
 *
 * See <a href="#inheritance">Template Inheritance</a> for more information.
 *
 * Examples:
 *
 *      {% extends "./foo.html" %}
 *      {% block content %}
 *        My content.
 *        {% parent %}
 *      {% endblock %}
 *
 */
exports.parent = require('./tags/parent');

/**
 * Forces the content to not be auto-escaped. All swig instructions will be ignored and the content will be rendered exactly as it was given.
 *
 * Examples:
 *
 *      // foobar = '<p>'
 *      {% raw %}{{ foobar }}{% endraw %}
 *      // => {{ foobar }}
 *
 * @type {[type]}
 */
exports.raw = require('./tags/raw');

/**
 * Set a variable for re-use in the current context.
 *
 * Examples:
 *
 *      {% set foo = "anything!" %}
 *      {{ foo }}
 *      // => anything!
 *
 *      // index = 2;
 *      {% set bar = 1 %}
 *      {% set bar += index|default(3) %}
 *      // => 3
 *
 * @param {literal} varname   The variable name to assign the value to.
 * @param {literal} assignement   Any valid JavaScript assignement. <code data-language="js">=, +=, *=, /=, -=</code>
 * @param {mixed}   value     Valid variable output.
 */
exports.set = require('./tags/set');

/**
 * Attempts to remove whitespace between HTML tags. Use at your own risk.
 *
 * Examples:
 *
 *      {% spaceless %}
 *        {% for num in foo %}
 *        <li>{{ loop.index }}</li>
 *        {% endfor %}
 *      {% endspaceless %}
 *      // => <li>1</li><li>2</li><li>3</li>
 *
 */
exports.spaceless = require('./tags/spaceless');
