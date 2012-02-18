var testCase = require('nodeunit').testCase,
    util = require('util'),
    swig = require('../index');

exports['custom tags'] =  function (test) {
    var tags = {
            foo: function (indent) {
                return '_output += "hi!";';
            }
        },
        tpl;

    tags.foo.ends = true;

    swig.init({ tags: tags });

    tpl = swig.compile('{% foo %}{% endfoo %}');
    test.strictEqual(tpl({}), 'hi!');
    test.done();
};
