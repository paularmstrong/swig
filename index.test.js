var swig = require('./index'),
    testCase = require('nodeunit').testCase;

exports.init = testCase({
    'custom filtersm': function (test) {
        swig.init({ filters: {
            foo: function (input) {
                return 'bar';
            }
        }});

        var tpl = swig.compile('{{ asdf|foo }}');
        test.strictEqual(tpl({ asdf: 'blah' }), 'bar');
        test.done();
    },

    'allowErrors = false': function (test) {
        swig.init({
            root: __dirname + '/tests/templates',
            allowErrors: false
        });
        var tpl = swig.compileFile('foobar.html');
        test.ok((/<pre>Error\: ENOENT, no such file or directory/i).test(tpl.render()), 'pushes a render function with the error');
        tpl = swig.compileFile('includes_notfound.html');
        test.ok((/<pre>Error\: ENOENT, no such file or directory/i).test(tpl.render()), 'renders the error when includes a file that is not found');

        test.done();
    },

    'allowErrors = true': function (test) {
        swig.init({ allowErrors: true });
        test.throws(function () {
            swig.compileFile('barfoo.html');
        }, 'throws when allowErrors is true');

        test.done();
    },

    'custom extensions': function (test) {
        test.expect(1);
        swig.init({
            allowErrors: true,
            extensions: { foobar: function () { test.ok(true); } },
            tags: {
                foo: function (indent) {
                    return '_ext.foobar();';
                }
            }
        });

        var tpl = swig.compile('{% foo %}');
        tpl();
        test.done();
    }
});

exports.compileFile = testCase({
    setUp: function (callback) {
        callback();
    },

    basic: function (test) {
        swig.init({
            root: __dirname + '/tests/templates',
            allowErrors: true
        });

        var tpl = swig.compileFile('included_2.html');
        test.strictEqual('2', tpl.render({ array: [1, 1] }), 'from file is a-ok');
        test.done();
    },

    'using context var with extends tag' : function (test) {
        swig.init({
            root: __dirname + '/tests/templates',
            allowErrors: true
        });

        var tpl, r1, r2, r3, r4;

        tpl = swig.compileFile('extends_dynamic.html');
        r1 = tpl.render({baseTmpl: "extends_base.html"});
        r2 = tpl.render({baseTmpl: "extends_base2.html"});
        r3 = tpl.render({baseTmpl: "extends_base.html"});
        r4 = tpl.render({baseTmpl: "extends_base2.html"});

        test.strictEqual(r1, r3, "rendering the same template with the same context twice, should return identically.");
        test.strictEqual(r2, r4, "rendering the same template with the same context twice, should return identically.");

        test.notEqual(r1, r2, "these should not be equal, as they use different base templates.");

        test.done();
    },

    'absolute path': function (test) {
        swig.init({
            root: __dirname + '/tests/templates',
            allowErrors: true
        });
        var tpl = swig.compileFile('/' + __dirname + '/tests/templates/included_2.html');
        test.strictEqual('2', tpl.render({ array: [1, 1] }), 'file from absolute path is a-ok');
        test.done();
    },

    'throws on window': function (test) {
        swig.init({});
        global.window = true;
        test.throws(function () {
            swig.compileFile('foobar');
        });
        delete global.window;
        test.done();
    },

    'render without context': function (test) {
        test.strictEqual(swig.compile('{% set foo = "foo" %}{{ foo }}')(), 'foo', 'this should not throw');
        test.done();
    }
});

exports.Errors = testCase({
    'allow - parse error': function (test) {
        swig.init({ allowErrors: true });

        test.throws(function () {
            swig.compile('{% for foo in blah %}{% endif %}');
        }, Error);
        test.done();
    },

    'allow - compile error': function (test) {
        swig.init({
            allowErrors: true,
            tags: { foo: function (indent) {
                return 'blargh;';
            }}
        });

        var tpl = swig.compile('{% foo %}');
        test.throws(function () {
            tpl({});
        }, Error);
        test.done();
    },

    'disallow - parse error': function (test) {
        swig.init({});

        test.doesNotThrow(function () {
            swig.compile('{% for foo in bar %}{% endif %}');
        }, Error);
        test.done();
    },

    'disallow - compile error': function (test) {
        swig.init({
            tags: { foobar: function (indent) {
                return 'blargh;';
            }}
        });

        var tpl = swig.compile('{% foobar %}');
        test.doesNotThrow(function () {
            tpl({});
        }, Error);
        test.done();
    }
});

exports['double-escape forward-slash'] = function (test) {
    swig.init({});

    var tpl = swig.compile('foobar\\/');
    test.strictEqual(tpl({}), 'foobar\\/');

    test.done();
};
