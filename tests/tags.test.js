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
    }
});
