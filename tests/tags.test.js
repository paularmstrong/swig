var testCase = require('nodeunit').testCase,
    swig = require('../index');

exports['custom tags'] =  function (test) {
    var tags = {
            foo: function (indent) {
                return '__output.push("hi!");';
            }
        },
        tmpl8;

    tags.foo.ends = true;

    swig.init({ tags: tags });

    tmpl8 = swig.fromString('{% foo %}{% endfoo %}');
    test.strictEqual(tmpl8.render({}), 'hi!');
    test.done();
};

exports.if = testCase({
    basic: function (test) {
        swig.init({});

        var tmpl8 = swig.fromString('{% if foo %}hi!{% endif %}{% if bar %}nope{% endif %}');
        test.strictEqual(tmpl8.render({ foo: 1, bar: false }), 'hi!');
        test.done();
    },

    'var literals in tags allow filters': function (test) {
        var tmpl8 = swig.fromString('{% if foo|length > 1 %}hi!{% endif %}');
        test.strictEqual(tmpl8.render({ foo: [1, 2, 3] }), 'hi!');

        tmpl8 = swig.fromString('{% if foo|length === bar|length %}hi!{% endif %}{% if foo|length !== bar|length %}fail{% endif %}');
        test.strictEqual(tmpl8.render({ foo: [1, 2], bar: [3, 4] }), 'hi!');
        test.done();
    },

    else: function (test) {
        var tmpl8 = swig.fromString('{% if foo|length > 1 %}hi!{% else %}nope{% endif %}');
        test.strictEqual(tmpl8.render({ foo: [1, 2, 3] }), 'hi!');
        test.strictEqual(tmpl8.render({ foo: [1] }), 'nope');

        test.throws(function () {
            swig.fromString('{% for i in foo %}hi!{% else %}nope{% endfor %}');
        }, Error, 'Cannot call else tag outside of "if" context.');
        test.done();
    },

    'else if': function (test) {
        var tmpl8 = swig.fromString('{% if foo|length > 2 %}foo{% else if foo|length < 2 %}bar{% endif %}');
        test.strictEqual(tmpl8.render({ foo: [1, 2, 3] }), 'foo');
        test.strictEqual(tmpl8.render({ foo: [1, 2] }), '');
        test.strictEqual(tmpl8.render({ foo: [1] }), 'bar');

        test.done();
    }
});

exports.for = testCase({
    basic: function (test) {
        swig.init({});

        var tmpl8 = swig.fromString('{% for foo in bar %}{{ foo }}, {% endfor %}');
        test.strictEqual(tmpl8.render({ bar: ['foo', 'bar', 'baz'] }), 'foo, bar, baz, ');
        test.done();
    },

    index: function (test) {
        swig.init({});

        var tmpl8 = swig.fromString('{% for foo in bar %}{{ forloop.index }}{% endfor %}');
        test.strictEqual(tmpl8.render({ bar: ['foo', 'bar', 'baz'] }), '012');
        test.done();
    },

    'loop object allows filters': function (test) {
        swig.init({});

        var tmpl8 = swig.fromString('{% for foo in bar|reverse %}{{ foo }}{% endfor %}');
        test.strictEqual(tmpl8.render({ bar: ['baz', 'bar', 'foo'] }), 'foobarbaz');
        test.done();
    }
});