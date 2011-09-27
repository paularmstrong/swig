var swig = require('../index'),
    testCase = require('nodeunit').testCase;

exports.fromFile = testCase({
    setUp: function (callback) {
        callback();
    },

    basic: function (test) {
        swig.init({
            root: __dirname + '/templates',
            allowErrors: true
        });

        var tpl = swig.fromFile('included_2.html');
        test.strictEqual('2', tpl.render({ array: [1, 1] }), 'from file is a-ok');

        test.done();
    },

    'allowErrors = false': function (test) {
        swig.init({
            root: __dirname + '/templates',
            allowErrors: false
        });
        var tpl = swig.fromFile('foobar.html');
        test.ok((/<pre>Error\: EBADF, Bad file descriptor/).test(tpl.render()), 'pushes a render function with the error');
        tpl = swig.fromFile('includes_notfound.html');
        test.ok((/<pre>Error\: EBADF, Bad file descriptor/).test(tpl.render()), 'renders the error when includes a file that is not found');

        test.done();
    },

    'allowErrors = true': function (test) {
        swig.init({ allowErrors: true });
        test.throws(function () {
            swig.fromFile('barfoo.html');
        }, 'throws when allowErrors is true');

        test.done();
    }
});