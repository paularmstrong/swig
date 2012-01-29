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

        var tpl = swig.compile('{% foo %}');
        test.throws(function () {
            tpl({});
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

        var tpl = swig.compile('{% foobar %}');
        test.doesNotThrow(function () {
            tpl({});
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

        var tpl = swig.compile('{{ asdf|lower }}');
        test.strictEqual(tpl({ asdf: 'BLAH' }), 'blah');

        tpl = swig.compile('{{ date|date("F jS, Y") }}');
        test.strictEqual(tpl({ date: new Date(2011, 8, 24) }), 'September 24th, 2011');

        tpl = swig.compile("{{ date|date('F jS, Y') }}");
        test.strictEqual(tpl({ date: new Date(2011, 8, 24) }), 'September 24th, 2011');
        test.done();
    },

    'Custom Filters': function (test) {
        swig.init({ filters: {
            foo: function (input) {
                return 'bar';
            }
        }});

        var tpl = swig.compile('{{ asdf|foo }}');
        test.strictEqual(tpl({ asdf: 'blah' }), 'bar');
        test.done();
    },

    'notation': function (test) {
        swig.init({});

        var tpl = swig.compile('{{ a.b.c }}');
        test.strictEqual(tpl({ a: { b: { c: 'hi' }} }), 'hi', 'dot notation');

        tpl = swig.compile('{{ a[0][1] }}');
        test.strictEqual(tpl({ a: [['no', 'yes']] }), 'yes', 'array notation');

        tpl = swig.compile('{{ a[0].b[1] }}');
        test.strictEqual(tpl({ a: [{ b: ['no', 'yes'] }] }), 'yes', 'mixed notation');

        tpl = swig.compile('{{ a["b"].b[1] }}');
        test.strictEqual(tpl({ a: { b: { b: ['no', 'yes'] }} }), 'yes', 'mixed notation');

        tpl = swig.compile('{{ a[0][h.g.i]["c"].b[d] }}');
        test.strictEqual(tpl({ a: { '0': { q: { c: { b: { foo: 'hi!' }}}}}, h: { g: { i: 'q' } }, d: 'foo' }), 'hi!', 'stupid complex variable notation is stupid');

        test.done();
    }
});

exports['double-escape forward-slash'] = function (test) {
    swig.init({});

    var tpl = swig.compile('foobar\\/');
    test.strictEqual(tpl({}), 'foobar\\/');

    test.done();
};
