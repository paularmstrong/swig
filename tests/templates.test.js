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

exports.Tags = function (test) {
    swig.init({});

    var tmpl8 = swig.fromString('{% if foo %}hi!{% end %}{% if bar %}nope{% end %}');
    test.strictEqual(tmpl8.render({ foo: 1, bar: false }), 'hi!');
    test.done();
};

exports['Custom Tags'] = function (test) {
    var tags = {
            foo: function (indent) {
                return '__output.push("hi!")';
            }
        },
        tmpl8;

    tags.foo.ends = true;

    swig.init({ tags: tags });

    tmpl8 = swig.fromString('{% foo %}{% end %}');
    test.strictEqual(tmpl8.render({}), 'hi!');
    test.done();
};
