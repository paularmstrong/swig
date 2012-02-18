var testCase = require('nodeunit').testCase,
    swig = require('../../index');

exports.filter = testCase({
    setUp: function (callback) {
        swig.init({});
        callback();
    },

    basic: function (test) {
        var tpl = swig.compile('{% filter capitalize %}oh HEY there{% endfilter %}');
        test.strictEqual(tpl({}), 'Oh hey there');
        test.done();
    },

    'complex content': function (test) {
        var tpl = swig.compile('{% filter capitalize %}oh {{ foo }} {% if here %}here{% else %}there{% endif %}{% endfilter %}');
        test.strictEqual(tpl({ foo: 'HEY', here: true }), 'Oh hey here');
        test.done();
    },

    args: function (test) {
        var tpl = swig.compile('{% filter replace "\\." "!" "g" %}hi. my name is paul.{% endfilter %}');
        test.strictEqual(tpl({}), 'hi! my name is paul!');
        test.done();
    }
});
