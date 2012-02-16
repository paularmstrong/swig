var testCase = require('nodeunit').testCase,
    swig = require('../../index');

exports['for'] = testCase({
    setUp: function (callback) {
        swig.init({
            allowErrors: true
        });
        callback();
    },

    basic: function (test) {
        var tpl = swig.compile('{% for foo in bar %}{{ foo }}, {% endfor %}');
        test.strictEqual(tpl({ bar: ['foo', 'bar', 'baz'] }), 'foo, bar, baz, ', 'array loop');
        test.strictEqual(tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }}), 'foo, bar, baz, ', 'object loop');
        test.done();
    },

    variables: function (test) {
        var tpl = swig.compile('{% for foo in bar %}[{{ loop.index0 }}, {{ loop.key }}]{% endfor %}');
        test.strictEqual(tpl({ bar: ['foo', 'bar', 'baz'] }), '[0, 0][1, 1][2, 2]', 'array loop');
        test.strictEqual(tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }}), '[0, baz][1, pow][2, foo]', 'object loop');
        test.done();
    },

    context: function (test) {
        var inner = swig.compile('{{ f }}', { filename: "inner" }),
            tpl = swig.compile('{{ f }}{% for f in bar %}{{ f }}{% include "inner" %}{{ f }}{% endfor %}{{ f }}');
        test.strictEqual(tpl({ f: 'z', bar: ['a'] }), 'zaaaz', 'f is reset');
        test.strictEqual(tpl({ bar: ['a'] }), 'aaa', 'f remains undefined');
        test.done();
    },

    index: function (test) {
        var tpl = swig.compile('{% for foo in bar %}{{ loop.index }}{% endfor %}');
        test.strictEqual(tpl({ bar: ['foo', 'bar', 'baz'] }), '123', 'index in object');
        test.strictEqual(tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }}), '123', 'index in object');
        test.done();
    },

    index0: function (test) {
        var tpl = swig.compile('{% for foo in bar %}{{ loop.index0 }}{% endfor %}');
        test.strictEqual(tpl({ bar: ['foo', 'bar', 'baz'] }), '012', 'index0 in object');
        test.strictEqual(tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }}), '012', 'index0 in object');
        test.done();
    },

    revindex: function (test) {
        var tpl = swig.compile('{% for foo in bar %}{{ loop.revindex }}{% endfor %}');
        test.strictEqual(tpl({ bar: ['foo', 'bar', 'baz'] }), '321', 'revindex in object');
        test.strictEqual(tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }}), '321', 'revindex in object');
        test.done();
    },

    revindex0: function (test) {
        var tpl = swig.compile('{% for foo in bar %}{{ loop.revindex0 }}{% endfor %}');
        test.strictEqual(tpl({ bar: ['foo', 'bar', 'baz'] }), '210', 'revindex0 in object');
        test.strictEqual(tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }}), '210', 'revindex0 in object');
        test.done();
    },

    first: function (test) {
        var tpl = swig.compile('{% for foo in bar %}{% if loop.first %}{{ foo }}{% endif %}{% endfor %}');
        test.strictEqual(tpl({ bar: ['foo', 'bar', 'baz'] }), 'foo', 'first in array');
        test.strictEqual(tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }}), 'foo', 'first in object');
        test.done();
    },

    last: function (test) {
        var tpl = swig.compile('{% for foo in bar %}{% if loop.last %}{{ foo }}{% endif %}{% endfor %}');
        test.strictEqual(tpl({ bar: ['foo', 'bar', 'baz'] }), 'baz', 'last in array');
        test.strictEqual(tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }}), 'baz', 'last in object');
        test.done();
    },

    cycle: function (test) {
        var tpl = swig.compile('{% for foo in bar %}{{ loop.cycle("odd", "even") }} {% endfor %}');
        test.strictEqual(tpl({ bar: ['a', 'b', 'c', 'd'] }), 'odd even odd even ', 'cycle');

        tpl = swig.compile('{% for foo in bar %}{{ loop.cycle("a", "b", "c", "d") }} {% endfor %}');
        test.strictEqual(tpl({ bar: [1, 2, 3, 4, 5, 6, 7] }), 'a b c d a b c ', 'cycle with 4 args');

        tpl = swig.compile('{% for foo in bar %}{{ loop.cycle("oh") }}, {% endfor %}{{ loop.cycle }}');
        test.strictEqual(tpl({ bar: [0], loop: { cycle: 'hi' }}), 'oh, hi', 'loop.cycle is reset');
        test.done();
    },

    'loop object allows filters': function (test) {
        var tpl = swig.compile('{% for foo in bar|reverse %}{{ foo }}{% endfor %}');
        test.strictEqual(tpl({ bar: ['baz', 'bar', 'foo'] }), 'foobarbaz');
        test.done();
    },

    'use loop.index0 in var': function (test) {
        var tpl = swig.compile('{% for key in bar %}{{ foo[loop.index0] }} {% endfor %}');
        test.strictEqual(tpl({ bar: ['a', 'b', 'c'], foo: ['hi', 'and', 'bye' ]}), 'hi and bye ');
        test.done();
    }
});
