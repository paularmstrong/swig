var testCase = require('nodeunit').testCase,
    swig = require('../index');

exports.Errors = testCase({
    'allow - parse error': function (test) {
        swig.init({ allowErrors: true });

        test.throws(function () {
            swig.compile('{% for foo in blah %}{% endif %}');
        }, Error);
        test.done();
    },

    'allow - compile error': function (test) {
        swig.init({
            allowErrors: true,
            tags: { foo: function (indent) {
                return 'blargh;';
            }}
        });

        var tmpl8 = swig.compile('{% foo %}');
        test.throws(function () {
            tmpl8({});
        }, Error);
        test.done();
    },

    'disallow - parse error': function (test) {
        swig.init({});

        test.doesNotThrow(function () {
            swig.compile('{% for foo in bar %}{% endif %}');
        }, Error);
        test.done();
    },

    'disallow - compile error': function (test) {
        swig.init({
            tags: { foobar: function (indent) {
                return 'blargh;';
            }}
        });

        var tmpl8 = swig.compile('{% foobar %}');
        test.doesNotThrow(function () {
            tmpl8({});
        }, Error);
        test.done();
    }
});

exports.Variables = testCase({
    Filters: function (test) {
        swig.init({ filters: {
            foo: function (input) {
                return 'bar';
            }
        }});

        var tmpl8 = swig.compile('{{ asdf|lower }}');
        test.strictEqual(tmpl8({ asdf: 'BLAH' }), 'blah');

        tmpl8 = swig.compile('{{ date|date("F jS, Y") }}');
        test.strictEqual(tmpl8({ date: new Date(2011, 8, 24) }), 'September 24th, 2011');

        tmpl8 = swig.compile("{{ date|date('F jS, Y') }}");
        test.strictEqual(tmpl8({ date: new Date(2011, 8, 24) }), 'September 24th, 2011');
        test.done();
    },

    'Custom Filters': function (test) {
        swig.init({ filters: {
            foo: function (input) {
                return 'bar';
            }
        }});

        var tmpl8 = swig.compile('{{ asdf|foo }}');
        test.strictEqual(tmpl8({ asdf: 'blah' }), 'bar');
        test.done();
    },

    'notation': function (test) {
        swig.init({});

        var tmpl8 = swig.compile('{{ a.b.c }}');
        test.strictEqual(tmpl8({ a: { b: { c: 'hi' }} }), 'hi', 'dot notation');

        tmpl8 = swig.compile('{{ a[0][1] }}');
        test.strictEqual(tmpl8({ a: [['no', 'yes']] }), 'yes', 'array notation');

        tmpl8 = swig.compile('{{ a[0].b[1] }}');
        test.strictEqual(tmpl8({ a: [{ b: ['no', 'yes'] }] }), 'yes', 'mixed notation');

        tmpl8 = swig.compile('{{ a["b"].b[1] }}');
        test.strictEqual(tmpl8({ a: { b: { b: ['no', 'yes'] }} }), 'yes', 'mixed notation');

        test.done();
    }
});

exports['double-escape forward-slash'] = function (test) {
    swig.init({});

    var tpl = swig.compile('foobar\\/');
    test.strictEqual(tpl({}), 'foobar\\/');

    test.done();
};
