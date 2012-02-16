var testCase = require('nodeunit').testCase,
    swig = require('../../index');

exports.macro = testCase({
    setUp: function (callback) {
        swig.init({ root: __dirname + '/../../tests/templates' });
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
