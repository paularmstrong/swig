var swig = require('../index'),
    testCase = require('nodeunit').testCase;

exports.compileFile = testCase({
    setUp: function (callback) {
        callback();
    },

    basic: function (test) {
        swig.init({
            root: __dirname + '/templates',
            allowErrors: true
        });

        var tpl = swig.compileFile('included_2.html');
        test.strictEqual('2', tpl.render({ array: [1, 1] }), 'from file is a-ok');
        test.done();
    },

    'allowErrors = false': function (test) {
        swig.init({
            root: __dirname + '/templates',
            allowErrors: false
        });
        var tpl = swig.compileFile('foobar.html');
        test.ok((/<pre>Error\: ENOENT, No such file or directory/).test(tpl.render()), 'pushes a render function with the error');
        tpl = swig.compileFile('includes_notfound.html');
        test.ok((/<pre>Error\: ENOENT, No such file or directory/).test(tpl.render()), 'renders the error when includes a file that is not found');

        test.done();
    },

    'allowErrors = true': function (test) {
        swig.init({ allowErrors: true });
        test.throws(function () {
            swig.compileFile('barfoo.html');
        }, 'throws when allowErrors is true');

        test.done();
    },

    'absolute path': function (test) {
        swig.init({
            root: __dirname + '/foobar',
            allowErrors: true
        });
        var tpl = swig.compileFile('/' + __dirname + '/templates/included_2.html');
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
    }
});