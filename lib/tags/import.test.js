var testCase = require('nodeunit').testCase,
    swig = require('../../index');

exports.macro = testCase({
    setUp: function (callback) {
        swig.init({ root: __dirname + '/../../tests/templates' });
        callback();
    },

    basic: function (test) {
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
