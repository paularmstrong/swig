var swig = require('./index'),
    testCase = require('nodeunit').testCase,
    ENOENT_RX = /<pre>Error\: ENOENT, no such file or directory/i;

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
        test.ok(ENOENT_RX.test(tpl.render()), 'pushes a render function with the error');
        tpl = swig.compileFile('includes_notfound.html');
        test.ok(ENOENT_RX.test(tpl.render()), 'renders the error when includes a file that is not found');

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

exports.engine = testCase({
    setUp: (function () {
        var engineA, engineB;

        engineA = swig.engine({
            filters: {
                foo: function (input) {
                    return 'engineA';
                }
            },
            root: __dirname + '/tests/templates',
            allowErrors: false,
            extensions: {
                foobar: function () {
                    engineA.extensionTestValue = 1;
                }
            },
            tags: {
                foo: function () {
                    return '_ext.foobar();';
                }
            }
        });
        engineA.extensionTestValue = null;

        engineB = swig.engine({
            filters: {
                foo: function (input) {
                    return 'engineB';
                }
            },
            root: __dirname + '/tests/templates',
            allowErrors: true,
            extensions: {
                foobar: function () {
                    engineB.extensionTestValue = 1;
                }
            },
            tags: {
                foo: function () {
                    return '_ext.foobar();';
                }
            }
        });
        engineB.extensionTestValue = null;

        return function (callback) {
            this.engineA = engineA;
            this.engineB = engineB;
            this.stashCompile = swig.compile;
            this.stashCompileFile = swig.compileFile;
            callback();
        };
    }()),

    tearDown: function (callback) {
        swig.compile = this.stashCompile;
        swig.compileFile = this.stashCompileFile;
        callback();
    },

    'usage A custom filters': function (test) {
        var tpl = this.engineA.compile('{{ asdf|foo }}');
        test.strictEqual(tpl({ asdf: 'blah' }), 'engineA');
        test.done();
    },

    'usage B custom filters': function (test) {
        var tpl = this.engineB.compile('{{ asdf|foo }}');
        test.strictEqual(tpl({ asdf: 'blah' }), 'engineB');
        test.done();
    },

    'usage A allowErrors = false': function (test) {
        var tpl = this.engineA.compileFile('foobar.html');
        test.ok(ENOENT_RX.test(tpl.render()), 'pushes a render function with the error');
        tpl = this.engineA.compileFile('includes_notfound.html');
        test.ok(ENOENT_RX.test(tpl.render()), 'renders the error when includes a file that is not found');
        test.done();
    },

    'usage B allowErrors = true': function (test) {
        test.throws(function () {
            this.engineA.compileFile('barfoo.html');
        }, 'throws when allowErrors is true');

        test.done();
    },

    'custom extensions': function (test) {
        test.strictEqual(this.engineA.extensionTestValue, null, 'extension A test value init null');
        test.strictEqual(this.engineB.extensionTestValue, null, 'extension B test value init null');

        var tpl = this.engineA.compile('{% foo %}');
        tpl();
        test.strictEqual(this.engineA.extensionTestValue, 1, 'extension A test value');

        tpl = this.engineB.compile('{% foo %}');
        tpl();
        test.strictEqual(this.engineB.extensionTestValue, 1, 'extension B test value');
        test.done();
    },

    'use global defaults': function (test) {
        var engine = swig.engine();

        swig.compile = function (source, options, conf) {
            test.strictEqual(conf.allowErrors, false, 'allowErrors defaults to false');
            test.strictEqual(conf.encoding, 'utf8', 'encoding defaults to utf8');
            test.strictEqual(conf.root, '/', 'root defaults to /');
        };

        swig.compileFile = function (filepath, conf) {
            test.strictEqual(conf.autoescape, true, 'autoescape defaults to true');
            test.strictEqual(conf.cache, true, 'cache defaults to true');
            test.strictEqual(conf.tzOffset, 0, 'tzOffset defaults to 0');
        };

        engine.compile();
        engine.compileFile();

        test.expect(6);
        test.done();
    },

    'configure global defaults': function (test) {
        swig.init({
            allowErrors: true,
            root: '/foo/templates',
            cache: false
        });

        var engine = swig.engine({
            root: '/bar/templates',
            encoding: 'bollocks'
        });

        swig.compile = function (source, options, conf) {
            test.strictEqual(conf.allowErrors, true, 'allowErrors should be true');
            test.strictEqual(conf.encoding, 'bollocks', 'encoding should be bollocks');
            test.strictEqual(conf.root, '/bar/templates', 'root should be /bar/templates');
        };

        swig.compileFile = function (filepath, conf) {
            test.strictEqual(conf.autoescape, true, 'autoescape defaults to true');
            test.strictEqual(conf.cache, false, 'cache should be false');
            test.strictEqual(conf.tzOffset, 0, 'tzOffset defaults to 0');
        };


        engine.compile();
        engine.compileFile();

        test.expect(6);
        test.done();
    }
});
