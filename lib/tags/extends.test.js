var testCase = require('nodeunit').testCase,
    swig = require('../../index');

exports['extends'] = testCase({
    setUp: function (callback) {
        swig.init({ root: __dirname + '/../../tests/templates' });
        this.extends_base = [
            'This is from the "extends_base.html" template.',
            '',
            '{% block one %}',
            '  This is the default content in block \'one\'',
            '{% endblock %}',
            '',
            '{% block two %}',
            '  This is the default content in block \'two\'',
            '{% endblock %}'
        ].join('\n');
        this.extends1 = [
            '{% extends "extends_base.html" %}',
            'This is content from "extends_1.html", you should not see it',
            '',
            '{% block one %}',
            '  This is the "extends_1.html" content in block \'one\'',
            '{% endblock %}'
        ].join('\n');
        this.circular1 = "{% extends 'extends_circular2.html' %}{% block content %}Foobar{% endblock %}";
        this.circular2 = "{% extends 'extends_circular1.html' %}{% block content %}Barfoo{% endblock %}";
        callback();
    },

    basic: function (test) {
        var tpl;
        if (typeof window !== 'undefined') {
            swig.compile(this.extends_base, { filename: 'extends_base.html' });
            tpl = swig.compile(this.extends1, { filename: 'extends1.html' });
            test.strictEqual('This is from the "extends_base.html" template.\n\n\n  This is the "extends_1.html" content in block \'one\'\n\n\n  This is the default content in block \'two\'\n', tpl({}));
        } else {
            tpl = swig.compileFile('extends_1.html');
            test.strictEqual('This is from the "extends_base.html" template.\n\n\n  This is the "extends_1.html" content in block \'one\'\n\n\n  This is the default content in block \'two\'\n', tpl.render({}));
        }
        test.done();
    },

    circular: function (test) {
        var tpl;
        if (typeof window !== 'undefined') {
            swig.init({ allowErrors: true });
            test.throws(function () {
                swig.compile(this.circular1, { filename: 'extends_circular1.html' });
                tpl = swig.compile(this.circular2, { filename: 'extends_circular2.html' });
                tpl();
            });
        } else {
            tpl = swig.compileFile('extends_circular1.html');
            test.ok((/^<pre>Error: Circular extends found on line 3 of \"extends_circular1\.html\"\!/).test(tpl.render({})), 'throws an error');
        }
        test.done();
    }
});
