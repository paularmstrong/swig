var testCase = require('nodeunit').testCase,
    swig = require('../../index');

var templates = {
    partial:        '{{ foo }}',
    'included':     'included ok',

    'htmlPass':     '{% partial "partial" %}' +
                    '    {% arg foo %}<div/>{% endarg %}' +
                    '{% endpartial %}',

    'includePass':  '{% partial "partial" %}' +
                    '    {% arg foo %}before {% include "included" %} after{% endarg %}' +
                    '{% endpartial %}',

    'varAsPartialName': '{% set partName = "partial" %}' +
                        '{% partial partName %}' +
                        '    {% arg foo %}bar{% endarg %}' +
                        '{% endpartial %}',

    'externalVar':  '{% partial "partial" %}' +
                    '    {% arg foo %}{{ bar }}{% endarg %}' +
                    '{% endpartial %}',

    'varSetting':   '{% set bar = "baz" %}' +
                    '{% partial "partial" %}' +
                    '    {% arg foo %}{{ bar }}{% endarg %}' +
                    '{% endpartial %}',

    'boolExpr':     '{% partial "partial" %}' +
                    '    {% arg foo %}{% if bar %}Yep!{% else %}Nope!{% endif %}{% endarg %}' +
                    '{% endpartial %}'
};

exports.partial = testCase({
    setUp: function (callback) {
        swig.init({
            root: __dirname + '/../../tests/templates',
            allowErrors: true,
            autoescape: false
        });

        swig.compile(templates.partial, {filename: 'partial'});
        callback();
    },

    'pass HTML': function (test) {
        var tpl = swig.compile(templates.htmlPass);
        test.strictEqual(tpl(), '<div/>');
        test.done();
    },

    'include result passing': function (test) {
        swig.compile(templates.included, {filename: 'included'});
        var tpl = swig.compile(templates.includePass);
        test.strictEqual(tpl(), 'before ' + templates.included + ' after');
        test.done();
    },

    'variable as partial name': function (test) {
        var tpl = swig.compile(templates.varAsPartialName);
        test.strictEqual(tpl(), 'bar');
        test.done();
    },

    'external variable passing': function (test) {
        var tpl = swig.compile(templates.externalVar);
        test.strictEqual(tpl({bar: 'baz'}), 'baz');
        test.done();
    },

    '{% set variable %} passing': function (test) {
        var tpl = swig.compile(templates.varSetting);
        test.strictEqual(tpl({bar: 'baz'}), 'baz');
        test.done();
    },

    'if-else inside arg': function (test) {
        var tpl = swig.compile(templates.boolExpr);
        test.strictEqual(tpl({bar: true}), 'Yep!');
        test.strictEqual(tpl({bar: false}), 'Nope!');
        test.done();
    }
});


