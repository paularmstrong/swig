var testCase = require('nodeunit').testCase,
    swig = require('../index');

exports.Variables = testCase({
    Filters: function (test) {
        swig.init({ filters: {
            foo: function (input) {
                return 'bar';
            }
        }});

        var tmpl8 = swig.fromString('{{ asdf|lower }}');
        test.strictEqual(tmpl8.render({ asdf: 'BLAH' }), 'blah');
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

        test.done();
    }
});

exports.Tags = testCase({
    Tags: function (test) {
        swig.init({});

        var tmpl8 = swig.fromString('{% if foo %}hi!{% end %}{% if bar %}nope{% end %}');
        test.strictEqual(tmpl8.render({ foo: 1, bar: false }), 'hi!');
        test.done();
    },

    'Custom Tags': function (test) {
        var tags = {
                foo: function (indent) {
                    return '__output.push("hi!")';
                }
            },
            tmpl8;

        tags.foo.ends = true;

        swig.init({ tags: tags });

        tmpl8 = swig.fromString('{% foo %}{% end %}');
        test.strictEqual(tmpl8.render({}), 'hi!');
        test.done();
    },
});
