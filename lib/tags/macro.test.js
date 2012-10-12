var testCase = require('nodeunit').testCase,
    swig = require('../../index');

exports.macro = testCase({
    setUp: function (callback) {
        swig.init({ root: __dirname + '/../../tests/templates' });
        callback();
    },

    basic: function (test) {
        var tpl = swig.compile('{% macro foo %}hi!{% endmacro %}oh, {{ foo }}');
        test.strictEqual(tpl({}), 'oh, hi!');
        test.done();
    },

    args: function (test) {
        var tpl = swig.compile('{% macro foo input %}{{ input }}{% endmacro %}oh, {{ foo("yep") }}');
        test.strictEqual(tpl({}), 'oh, yep');
        test.done();
    },

    complex: function (test) {
        var tpl = swig.compile([
            '{% macro input type name id label value %}',
            '<label for="{{ name }}">{{ label }}</label>',
            '<input type="{{ type }}" name="{{ name }}" id="{{ id }}" value="{{ value }}">',
            '{% endmacro %}',
            '{{ input("text", "person", person.id, "Your Name") }}'
        ].join(''));
        test.strictEqual(tpl({
            person: { id: 'asdf', name: 'Paul' }
        }), '<label for="person">Your Name</label><input type="text" name="person" id="asdf" value="">');
        test.done();
    },

    trailing_whitespace: function (test) {
        var tpl = swig.compile([
            '{% macro input type name id label value %}',
            '<label for="{{ name }}">{{ label }}</label>',
            '<input type="{{ type }}" name="{{ name }}" id="{{ id }}" value="{{ value }}">',
            '{% endmacro %}',
            '{{ input( "text", "person", person.id, "Your Name", person.value ) }}'
        ].join(''));
        test.strictEqual(tpl({
            person: { id: 'asdf', name: 'Paul', value : 'val' }
        }), '<label for="person">Your Name</label><input type="text" name="person" id="asdf" value="val">');
        test.done();
    }
});
