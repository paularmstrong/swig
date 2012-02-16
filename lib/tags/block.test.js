var testCase = require('nodeunit').testCase,
    swig = require('../../index');

exports.block = testCase({
    setUp: function (callback) {
        swig.init({
            allowErrors: true
        });
        callback();
    },

    basic: function (test) {
        var tpl,
            extends_base = [
                'This is from the "extends_base.html" template.',
                '',
                '{% block one %}',
                '  This is the default content in block \'one\'',
                '{% endblock %}',
                '',
                '{% block two %}',
                '  This is the default content in block \'two\'',
                '{% endblock %}'
            ].join('\n'),
            extends1 = [
                '{% extends "extends_base.html" %}',
                'This is content from "extends_1.html", you should not see it',
                '',
                '{% block one %}',
                '  This is the "extends_1.html" content in block \'one\'',
                '{% endblock %}'
            ].join('\n');

        swig.compile(extends_base, { filename: 'extends_base.html' });
        tpl = swig.compile(extends1, { filename: 'extends1.html' });
        test.strictEqual('This is from the "extends_base.html" template.\n\n\n  This is the "extends_1.html" content in block \'one\'\n\n\n  This is the default content in block \'two\'\n', tpl({}));
        test.done();
    }
});
