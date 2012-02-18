var testCase = require('nodeunit').testCase,
    swig = require('../../index');

exports.include = testCase({
    setUp: function (callback) {
        swig.init({ root: __dirname + '/../../tests/templates' });
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

    'include from within parent template': function (test) {
        swig.init({ allowErrors: true });
        swig.compile('foobar', { filename: 'foobar' });
        swig.compile('{% include "foobar" %}', { filename: 'parent' });
        // ensure this doesn't throw
        var tpl = swig.compile('{% extends "parent" %}');
        test.strictEqual(tpl(), 'foobar');
        test.done();
    },

    variable: function (test) {
        if (typeof window !== 'undefined') {
            swig.compile('{{array.length}}', { filename: 'included_2.html' });
        }
        var tpl = swig.compile('{% include inc %}');
        test.strictEqual(tpl({ inc: 'included_2.html', array: ['foo'] }), '1');
        test.done();
    },

    'with context': function (test) {
        swig.compile('{{ foo }}{{ bar }}', { filename: 'withcontext' });
        var tpl = swig.compile('{% set foo = "1" %}{% include "withcontext" with foo %}');
        test.strictEqual(tpl({}), '1');

        tpl = swig.compile('{% set foo = "1" %}{% set bar = "2" %}{% include "withcontext" with foo bar %}');
        test.strictEqual(tpl({}), '12');

        test.throws(function () {
            swig.compile('{% include "withcontext" with %}');
        });
        test.done();
    },

    only: function (test) {
        swig.compile('{{ foo }}', { filename: 'only' });
        var tpl = swig.compile('{% include "only" only %}');
        test.strictEqual(tpl({ foo: 'nope' }), '');
        test.done();
    },

    'with only': function (test) {
        swig.compile('{{ foo }}{{ bar }}', { filename: 'withcontext' });
        var tpl = swig.compile('{% set foo = "1" %}{% include "withcontext" with foo only %}');
        test.strictEqual(tpl({}), '1');
        test.done();
    }
});
