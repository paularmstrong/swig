var testCase = require('nodeunit').testCase,
    swig = require('../index');

exports.Errors = testCase({
    'allow - parse error': function (test) {
        swig.init({ allowErrors: true });

        test.throws(function () {
            swig.fromString('{% for foo in blah %}{% endif %}');
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

        var tmpl8 = swig.fromString('{% foo %}');
        test.throws(function () {
            tmpl8.render({});
        }, Error);
        test.done();
    },

    'disallow - parse error': function (test) {
        swig.init({});

        test.doesNotThrow(function () {
            swig.fromString('{% for foo in bar %}{% endif %}');
        }, Error);
        test.done();
    },

    'disallow - compile error': function (test) {
        swig.init({
            tags: { foobar: function (indent) {
                return 'blargh;';
            }}
        });

        var tmpl8 = swig.fromString('{% foobar %}');
        test.doesNotThrow(function () {
            tmpl8.render({});
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

        var tmpl8 = swig.fromString('{{ asdf|lower }}');
        test.strictEqual(tmpl8.render({ asdf: 'BLAH' }), 'blah');

        tmpl8 = swig.fromString('{{ date|date("F jS, Y") }}');
        test.strictEqual(tmpl8.render({ date: new Date(2011, 8, 24) }), 'September 24th, 2011');

        tmpl8 = swig.fromString("{{ date|date('F jS, Y') }}");
        test.strictEqual(tmpl8.render({ date: new Date(2011, 8, 24) }), 'September 24th, 2011');
        test.done();
    },

    'Custom Filters': function (test) {
        swig.init({ filters: {
            foo: function (input) {
                return 'bar';
            }
        }});

        var tmpl8 = swig.fromString('{{ asdf|foo }}');
        test.strictEqual(tmpl8.render({ asdf: 'blah' }), 'bar');
        test.done();
    },

    'notation': function (test) {
        swig.init({});

        var tmpl8 = swig.fromString('{{ a.b.c }}');
        test.strictEqual(tmpl8.render({ a: { b: { c: 'hi' }} }), 'hi', 'dot notation');

        tmpl8 = swig.fromString('{{ a[0][1] }}');
        test.strictEqual(tmpl8.render({ a: [['no', 'yes']] }), 'yes', 'array notation');

        tmpl8 = swig.fromString('{{ a[0].b[1] }}');
        test.strictEqual(tmpl8.render({ a: [{ b: ['no', 'yes'] }] }), 'yes', 'mixed notation');

        tmpl8 = swig.fromString('{{ a["b"].b[1] }}');
        test.strictEqual(tmpl8.render({ a: { b: { b: ['no', 'yes'] }} }), 'yes', 'mixed notation');

        test.done();
    }
});

exports['double-escape forward-slash'] = function (test) {
    swig.init({});

    var tpl = swig.fromString('foobar\\/');
    test.strictEqual(tpl.render({}), 'foobar\\/');

    test.done();
};
