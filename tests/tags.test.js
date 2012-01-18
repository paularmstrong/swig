var testCase = require('nodeunit').testCase,
    util = require('util'),
    swig = require('../index');

exports['custom tags'] =  function (test) {
    var tags = {
            foo: function (indent) {
                return '__output += "hi!";';
            }
        },
        tpl;

    tags.foo.ends = true;

    swig.init({ tags: tags });

    tpl = swig.compile('{% foo %}{% endfoo %}');
    test.strictEqual(tpl({}), 'hi!');
    test.done();
};

exports.autoescape = testCase({
    setUp: function (callback) {
        swig.init({});
        callback();
    },

    on: function (test) {
        var tpl = swig.compile('{% autoescape on %}{{ foo }}{% endautoescape %}');
        test.strictEqual(tpl({ foo: '<\'single\' & "double" quotes>' }), '&lt;&#39;single&#39; &amp; &quot;double&quot; quotes&gt;');
        test.done();
    },

    off: function (test) {
        var tpl = swig.compile('{% autoescape off %}{{ foo }}{% endautoescape %}');
        test.strictEqual(tpl({ foo: '<\'single\' & "double" quotes>' }), '<\'single\' & "double" quotes>');
        test.done();
    },

    js: function (test) {
        var tpl = swig.compile('{% autoescape on "js" %}{{ foo }}{% endautoescape %}');
        test.strictEqual(tpl({ foo: '"double quotes" and \'single quotes\'' }), '\\u0022double quotes\\u0022 and \\u0027single quotes\\u0027');
        test.strictEqual(tpl({ foo: '<script>and this</script>' }), '\\u003Cscript\\u003Eand this\\u003C/script\\u003E');
        test.strictEqual(tpl({ foo: '\\ : backslashes, too' }), '\\u005C : backslashes, too');
        test.strictEqual(tpl({ foo: 'and lots of whitespace: \r\n\t\v\f\b' }), 'and lots of whitespace: \\u000D\\u000A\\u0009\\u000B\\u000C\\u0008');
        test.strictEqual(tpl({ foo: 'and "special" chars = -1;' }), 'and \\u0022special\\u0022 chars \\u003D \\u002D1\\u003B');
        test.done();
    }
});

exports['extends'] = testCase({
    setUp: function (callback) {
        swig.init({ root: __dirname + '/templates' });
        this.extends_base = [
            'This is from the "extends_base.html" template.',
            '',
            '{% block one %}',
            '  This is the default content in block \'one\'',
            '{% endblock %}',
            '',
            '{% block two %}',
            '  This is the default content in block \'two\'',
            '{% endblock %}'
        ].join('\n');
        this.extends1 = [
            '{% extends "extends_base.html" %}',
            'This is content from "extends_1.html", you should not see it',
            '',
            '{% block one %}',
            '  This is the "extends_1.html" content in block \'one\'',
            '{% endblock %}'
        ].join('\n');
        this.circular1 = "{% extends 'extends_circular2.html' %}{% block content %}Foobar{% endblock %}";
        this.circular2 = "{% extends 'extends_circular1.html' %}{% block content %}Barfoo{% endblock %}";
        callback();
    },

    basic: function (test) {
        var tpl;
        if (typeof window !== 'undefined') {
            swig.compile(this.extends_base, { filename: 'extends_base.html' });
            tpl = swig.compile(this.extends1, { filename: 'extends1.html' });
            test.strictEqual('This is from the "extends_base.html" template.\n\n\n  This is the "extends_1.html" content in block \'one\'\n\n\n  This is the default content in block \'two\'\n', tpl({}));
        } else {
            tpl = swig.compileFile('extends_1.html');
            test.strictEqual('This is from the "extends_base.html" template.\n\n\n  This is the "extends_1.html" content in block \'one\'\n\n\n  This is the default content in block \'two\'\n', tpl.render({}));
        }
        test.done();
    },

    circular: function (test) {
        var tpl;
        if (typeof window !== 'undefined') {
            swig.init({ allowErrors: true });
            test.throws(function () {
                swig.compile(this.circular1, { filename: 'extends_circular1.html' });
                tpl = swig.compile(this.circular2, { filename: 'extends_circular2.html' });
                tpl();
            });
        } else {
            tpl = swig.compileFile('extends_circular1.html');
            test.ok((/^<pre>Error: Circular extends found on line 3 of \"extends_circular1\.html\"\!/).test(tpl.render({})), 'throws an error');
        }
        test.done();
    }
});

exports.include = testCase({
    setUp: function (callback) {
        swig.init({ root: __dirname + '/templates' });
        callback();
    },

    basic: function (test) {
        if (typeof window !== 'undefined') {
            swig.compile('{{array.length}}', { filename: 'included_2.html' });
        }
        var tpl = swig.compile('{% include "included_2.html" %}');
        test.strictEqual(tpl({ array: ['foo'] }), '1');
        test.done();
    },

    variable: function (test) {
        if (typeof window !== 'undefined') {
            swig.compile('{{array.length}}', { filename: 'included_2.html' });
        }
        var tpl = swig.compile('{% include inc %}');
        test.strictEqual(tpl({ inc: 'included_2.html', array: ['foo'] }), '1');
        test.done();
    }
});

exports['if'] = testCase({
    setUp: function (callback) {
        swig.init({});
        callback();
    },

    basic: function (test) {
        var tpl = swig.compile('{% if foo %}hi!{% endif %}{% if bar %}nope{% endif %}');
        test.strictEqual(tpl({ foo: 1, bar: false }), 'hi!');

        tpl = swig.compile('{% if !foo %}hi!{% endif %}{% if !bar %}nope{% endif %}');
        test.strictEqual(tpl({ foo: 1, bar: false }), 'nope', '! operator');

        tpl = swig.compile('{% if not foo %}hi!{% endif %}{% if not bar %}nope{% endif %}');
        test.strictEqual(tpl({ foo: true, bar: false }), 'nope', 'not operator');

        tpl = swig.compile('{% if foo && (bar || baz) %}hi!{% endif %}');
        test.strictEqual(tpl({ foo: true, bar: true }), 'hi!');
        test.strictEqual(tpl({ foo: true, baz: true }), 'hi!');
        test.strictEqual(tpl({ foo: false }), '');

        tpl = swig.compile('{% if foo and bar %}hi!{% endif %}');
        test.strictEqual(tpl({ foo: true, bar: true }), 'hi!', 'and syntax');
        tpl = swig.compile('{% if foo or bar %}hi!{% endif %}');
        test.strictEqual(tpl({ foo: false, bar: true }), 'hi!', 'or syntax');

        tpl = swig.compile('{% if foo in bar %}hi!{% endif %}');
        test.strictEqual(tpl({ foo: 'b', bar: ['a', 'b', 'c'] }), 'hi!', 'in syntax');

        test.done();
    },

    errors: function (test) {
        test.throws(function () {
            swig.compile('{% if foo bar %}{% endif %}');
        });
        test.throws(function () {
            swig.compile('{% if foo !== > bar %}{% endif %}');
        });
        test.throws(function () {
            swig.compile('{% if (foo %}{% endif %}');
        });
        test.throws(function () {
            swig.compile('{% if foo > bar) %}{% endif %}');
        });
        test.done();
    },

    'var literals in tags allow filters': function (test) {
        var tpl = swig.compile('{% if foo|length > 1 %}hi!{% endif %}');
        test.strictEqual(tpl({ foo: [1, 2, 3] }), 'hi!');

        tpl = swig.compile('{% if foo|length === bar|length %}hi!{% endif %}{% if foo|length !== bar|length %}fail{% endif %}');
        test.strictEqual(tpl({ foo: [1, 2], bar: [3, 4] }), 'hi!');
        test.done();
    },

    'else': function (test) {
        var tpl = swig.compile('{% if foo|length > 1 %}hi!{% else %}nope{% endif %}');
        test.strictEqual(tpl({ foo: [1, 2, 3] }), 'hi!');
        test.strictEqual(tpl({ foo: [1] }), 'nope');

        test.throws(function () {
            swig.compile('{% for i in foo %}hi!{% else %}nope{% endfor %}');
        }, Error, 'Cannot call else tag outside of "if" context.');
        test.done();
    },

    'else if': function (test) {
        var tpl = swig.compile('{% if foo|length > 2 %}foo{% else if foo|length < 2 %}bar{% endif %}');
        test.strictEqual(tpl({ foo: [1, 2, 3] }), 'foo');
        test.strictEqual(tpl({ foo: [1, 2] }), '');
        test.strictEqual(tpl({ foo: [1] }), 'bar');

        tpl = swig.compile('{% if foo %}foo{% else if bar && baz %}bar{% endif %}');
        test.strictEqual(tpl({ bar: true, baz: true }), 'bar');

        test.done();
    },

    'multiple else if and else': function (test) {
        var tpl = swig.compile('{% if foo %}foo{% else if bar === "bar" %}bar{% else if 3 in baz %}baz{% else %}bop{% endif %}');
        test.strictEqual(tpl({ foo: true }), 'foo');
        test.strictEqual(tpl({ bar: "bar" }), 'bar');
        test.strictEqual(tpl({ baz: [3] }), 'baz');
        test.strictEqual(tpl({ baz: [2] }), 'bop');
        test.strictEqual(tpl({ bar: false }), 'bop');

        test.done();
    }
});

exports['for'] = testCase({
    setUp: function (callback) {
        swig.init({});
        callback();
    },

    basic: function (test) {
        var tpl = swig.compile('{% for foo in bar %}{{ foo }}, {% endfor %}');
        test.strictEqual(tpl({ bar: ['foo', 'bar', 'baz'] }), 'foo, bar, baz, ', 'array loop');
        test.strictEqual(tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }}), 'foo, bar, baz, ', 'object loop');
        test.done();
    },

    variables: function (test) {
        var tpl = swig.compile('{% for foo in bar %}[{{ forloop.index }}, {{ forloop.key }}]{% endfor %}');
        test.strictEqual(tpl({ bar: ['foo', 'bar', 'baz'] }), '[0, 0][1, 1][2, 2]', 'array loop');
        test.strictEqual(tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }}), '[0, baz][1, pow][2, foo]', 'object loop');
        test.done();
    },

    index: function (test) {
        var tpl = swig.compile('{% for foo in bar %}{{ forloop.index }}{% endfor %}');
        test.strictEqual(tpl({ bar: ['foo', 'bar', 'baz'] }), '012', 'index in object');
        test.strictEqual(tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }}), '012', 'index in object');
        test.done();
    },

    first: function (test) {
        var tpl = swig.compile('{% for foo in bar %}{% if forloop.first %}{{ foo }}{% endif %}{% endfor %}');
        test.strictEqual(tpl({ bar: ['foo', 'bar', 'baz'] }), 'foo', 'first in array');
        test.strictEqual(tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }}), 'foo', 'first in object');
        test.done();
    },

    last: function (test) {
        var tpl = swig.compile('{% for foo in bar %}{% if forloop.last %}{{ foo }}{% endif %}{% endfor %}');
        test.strictEqual(tpl({ bar: ['foo', 'bar', 'baz'] }), 'baz', 'last in array');
        test.strictEqual(tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }}), 'baz', 'last in object');
        test.done();
    },

    empty: function (test) {
        var tpl = swig.compile('{% for foo in bar %}blah{% empty %}hooray!{% endfor %}');
        test.strictEqual(tpl({ bar: [] }), 'hooray!', 'empty in array');
        test.strictEqual(tpl({ bar: {}}), 'hooray!', 'empty in object');

        test.strictEqual(tpl({ bar: [1] }), 'blah', 'not empty in array');
        test.strictEqual(tpl({ bar: { foo: 'foo' }}), 'blah', 'not empty in object');

        test.throws(function () {
            swig.compile('{% if foo %}hi!{% empty %}nope{% endif %}');
        }, Error, 'Cannot call "empty" tag outside of "for" context.');
        test.done();
    },

    'loop object allows filters': function (test) {
        var tpl = swig.compile('{% for foo in bar|reverse %}{{ foo }}{% endfor %}');
        test.strictEqual(tpl({ bar: ['baz', 'bar', 'foo'] }), 'foobarbaz');
        test.done();
    }
});

exports.set = testCase({
    setUp: function (callback) {
        swig.init({});
        callback();
    },

    basic: function (test) {
        var tpl = swig.compile('{% set foo = "bar" %} {{ foo }}');
        test.strictEqual(tpl({}), ' bar');
        test.done();
    },

    'from var': function (test) {
        var tpl = swig.compile('{% set foo = bar|lower %} {{ foo }}');
        test.strictEqual(tpl({ bar: 'BAR' }), ' bar');
        test.done();
    },

    'array': function (test) {
        var tpl = swig.compile('{% set foo = ["hi", "bye"] %} {{ foo[0] }}');
        test.strictEqual(tpl({}), ' hi');
        test.done();
    },

    'object': function (test) {
        var tpl = swig.compile('{% set foo = { bar: "bar" } %} {{ foo.bar }}');
        test.strictEqual(tpl({}), ' bar');
        test.done();
    }
});

exports.macro = testCase({
    setUp: function (callback) {
        swig.init({ root: __dirname + '/templates' });
        callback();
    },

    basic: function (test) {
        var tpl = swig.compile('{% macro foo %}hi!{% endmacro %}oh, {{ foo }}');
        test.strictEqual(tpl({}), 'oh, hi!');
        test.done();
    },

    args: function (test) {
        var tpl = swig.compile('{% macro foo input %}{{ input }}{% endmacro %}oh, {{ foo("yep") }}');
        test.strictEqual(tpl({}), 'oh, yep');
        test.done();
    },

    complex: function (test) {
        var tpl = swig.compile([
            '{% macro input type name id label value %}',
            '<label for="{{ name }}">{{ label }}</label>',
            '<input type="{{ type }}" name="{{ name }}" id="{{ id }}" value="{{ value }}">',
            '{% endmacro %}',
            '{{ input("text", "person", person.id, "Your Name") }}'
        ].join(''));
        test.strictEqual(tpl({
            person: { id: 'asdf', name: 'Paul' }
        }), '<label for="person">Your Name</label><input type="text" name="person" id="asdf" value="">');
        test.done();
    },

    'import': function (test) {
        if (typeof window !== 'undefined') {
            swig.compile('{% macro foo %}\nhi!\n{% endmacro %}\n\n{% macro bar baz %}\n{% if baz %}\nbye!\n{% else %}\nfudge.\n{% endif %}\n{% endmacro %}', { filename: 'macros.html' });
        }
        var tpl = swig.compile('{% import "macros.html" as blah %}{{ foo }}');
        test.strictEqual(tpl({}), '', 'importing as context does not override base context');

        tpl = swig.compile('{% import "macros.html" as blah %}{{ blah.foo }}, {{ blah.bar("baz") }}');
        test.strictEqual(tpl({}), '\nhi!\n, \n\nbye!\n\n', 'basic macros imported');
        test.done();
    },

    'import in parent template': function (test) {
        swig.compile('{% macro foo input %}hey, {{ input }}{% endmacro %}', { filename: 'blarbar.html' });
        swig.compile('{% import "blarbar.html" as mahmacros %} foobar {% block content %}{% endblock %}', { filename: 'parent.html' });

        var tpl = swig.compile('{% extends "parent.html" %} {% block content %}{{ mahmacros.foo("bar") }}{% endblock %}');

        test.strictEqual(tpl({}), ' foobar hey, bar');
        test.done();
    }
});

exports.filter = testCase({
    setUp: function (callback) {
        swig.init({});
        callback();
    },

    basic: function (test) {
        var tpl = swig.compile('{% filter capitalize %}oh HEY there{% endfilter %}');
        test.strictEqual(tpl({}), 'Oh hey there');
        test.done();
    },

    'complex content': function (test) {
        var tpl = swig.compile('{% filter capitalize %}oh {{ foo }} {% if here %}here{% else %}there{% endif %}{% endfilter %}');
        test.strictEqual(tpl({ foo: 'HEY', here: true }), 'Oh hey here');
        test.done();
    },

    args: function (test) {
        var tpl = swig.compile('{% filter replace "\\." "!" "g" %}hi. my name is paul.{% endfilter %}');
        test.strictEqual(tpl({}), 'hi! my name is paul!');
        test.done();
    }
});

exports.raw = testCase({
    setUp: function (callback) {
        swig.init({ allowErrors: true });
        callback();
    },

    basic: function (test) {
        var input = '{{ foo }} {% set bar = "foo" %}{% if foo %}blah: {{ foo }} {% block foobar %}{{ foo }}{% endblock %}{% endif %}',
            tpl = swig.compile('{%raw%}' + input + '{% endraw %}');
        test.strictEqual(tpl({ foo: 'foo' }), input);
        test.done();
    },

    'new lines': function (test) {
        var input = '\n{{ foo }}\n',
            tpl = swig.compile('{% raw %}' + input + '{% endraw %}');
        test.strictEqual(tpl({}), input);
        test.done();
    },

    'non-conforming': function (test) {
        var input = '{{ foo bar %} {% {#',
            tpl = swig.compile('{% raw %}' + input + '{% endraw %}');

        test.strictEqual(tpl({}), input);
        test.done();
    },

    'errors when no endraw tag found': function (test) {
        test.throws(function () {
            swig.compile('{% raw %}{{ foobar }}');
        }, Error);
        test.done();
    }
});

exports.comment = testCase({
    setUp: function (callback) {
        swig.init({});
    },
    basic: function (test) {
        var tpl = swig.compile('begin-{% comment %}there is {{ nothing }} here{% endcomment %}-end');
        test.strictEqual(tpl({ nothing: 'should not appear' }), 'begin--end');
        test.done();
    },
});
