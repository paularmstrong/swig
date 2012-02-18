var testCase = require('nodeunit').testCase,
    swig = require('../../index');

exports.autoescape = testCase({
    setUp: function (callback) {
        swig.init({});
        callback();
    },

    on: function (test) {
        var tpl = swig.compile('{% autoescape on %}{{ foo }}{% endautoescape %}');
        test.strictEqual(tpl({ foo: '<\'single\' & "double" quotes>' }), '&lt;&#39;single&#39; &amp; &quot;double&quot; quotes&gt;');
        test.done();
    },

    off: function (test) {
        var tpl = swig.compile('{% autoescape off %}{{ foo }}{% endautoescape %}');
        test.strictEqual(tpl({ foo: '<\'single\' & "double" quotes>' }), '<\'single\' & "double" quotes>');
        test.done();
    },

    'resets after endautoescape': function (test) {
        var tpl = swig.compile('{% autoescape off %}{% endautoescape %}{{ foo }}');
        test.strictEqual(tpl({ foo: '<\'single\' & "double" quotes>' }), '&lt;&#39;single&#39; &amp; &quot;double&quot; quotes&gt;');
        test.done();
    },

    js: function (test) {
        var tpl = swig.compile('{% autoescape on "js" %}{{ foo }}{% endautoescape %}');
        test.strictEqual(tpl({ foo: '"double quotes" and \'single quotes\'' }), '\\u0022double quotes\\u0022 and \\u0027single quotes\\u0027');
        test.strictEqual(tpl({ foo: '<script>and this</script>' }), '\\u003Cscript\\u003Eand this\\u003C/script\\u003E');
        test.strictEqual(tpl({ foo: '\\ : backslashes, too' }), '\\u005C : backslashes, too');
        test.strictEqual(tpl({ foo: 'and lots of whitespace: \r\n\t\v\f\b' }), 'and lots of whitespace: \\u000D\\u000A\\u0009\\u000B\\u000C\\u0008');
        test.strictEqual(tpl({ foo: 'and "special" chars = -1;' }), 'and \\u0022special\\u0022 chars \\u003D \\u002D1\\u003B');
        test.done();
    }
});
