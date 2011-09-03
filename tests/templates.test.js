var swig = require('../index');

exports.Filters = function (test) {
    swig.init({});

    var tmpl8 = swig.fromString('{{ asdf|lower }}');
    test.strictEqual(tmpl8.render({ asdf: 'BLAH' }), 'blah');
    test.done();
};

exports['Custom Filters'] = function (test) {
    swig.init({ filters: {
        foo: function (input) {
            return 'bar';
        }
    }});

    var tmpl8 = swig.fromString('{{ asdf|foo }}');
    test.strictEqual(tmpl8.render({ asdf: 'blah' }), 'bar');
    test.done();
};
