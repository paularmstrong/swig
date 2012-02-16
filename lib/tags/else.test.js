var testCase = require('nodeunit').testCase,
    swig = require('../../index');

exports['if'] = testCase({
    setUp: function (callback) {
        swig.init({
            allowErrors: true
        });
        callback();
    },

    'basic': function (test) {
        var tpl = swig.compile('{% if foo|length > 1 %}hi!{% else %}nope{% endif %}');
        test.strictEqual(tpl({ foo: [1, 2, 3] }), 'hi!');
        test.strictEqual(tpl({ foo: [1] }), 'nope');

        test.throws(function () {
            swig.compile('{% else %}');
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
    },

    'for else': function (test) {
        var tpl = swig.compile('{% for foo in bar %}blah{% else %}hooray!{% endfor %}');
        test.strictEqual(tpl({ bar: [] }), 'hooray!', 'else in array');
        test.strictEqual(tpl({ bar: {}}), 'hooray!', 'else in object');

        test.strictEqual(tpl({ bar: [1] }), 'blah', 'not else in array');
        test.strictEqual(tpl({ bar: { foo: 'foo' }}), 'blah', 'not else in object');

        test.throws(function () {
            swig.compile('{% for foo in bar %}hi!{% else if blah %}nope{% endfor %}');
        }, Error, '"else" tag cannot accept arguments in the "for" context.');
        test.done();
    }

});
