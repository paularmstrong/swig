var testCase = require('nodeunit').testCase,
    swig = require('../../index');

exports['extends'] = testCase({
    circular: function (test) {
        swig.init({ allowErrors: true });
        var circular1 = "{% extends 'extends_circular2.html' %}{% block content %}Foobar{% endblock %}",
            circular2 = "{% extends 'extends_circular1.html' %}{% block content %}Barfoo{% endblock %}";
        test.throws(function () {
            swig.compile(circular1, { filename: 'extends_circular1.html' });
            swig.compile(circular2, { filename: 'extends_circular2.html' })();
        });
        test.done();
    },

    'throws if not first tag': function (test) {
        test.throws(function () {
            swig.compile('asdf {% extends foo %}')();
        });
        test.done();
    }
});
