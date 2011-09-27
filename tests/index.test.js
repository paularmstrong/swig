var swig = require('../index'),
    testCase = require('nodeunit').testCase;

exports.fromFile = testCase({
    setUp: function (callback) {
        callback();
    },

    'file not exist': function (test) {
        swig.init({
            root: __dirname + '/templates',
            allowErrors: false
        });
        var tpl = swig.fromFile('foobar.html');
        test.ok((/<pre>Error\: EBADF, Bad file descriptor/).test(tpl.render()), 'pushes a render function with the error');
        tpl = swig.fromFile('includes_notfound.html');
        test.ok((/<pre>Error\: EBADF, Bad file descriptor/).test(tpl.render()), 'pushes a render function with the error');

        swig.init({ allowErrors: true });
        test.throws(function () {
            tpl = swig.fromFile('barfoo.html');
        }, 'throws when allowErrors is true');

        test.done();
    }
});