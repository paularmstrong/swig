var helpers = require('../lib/helpers');

exports.clone = function (test) {
    var obj = { foo: 1, bar: 2, baz: { bop: 3 } },
        out = helpers.clone(obj);

    test.deepEqual(out, { foo: 1, bar: 2, baz: { bop: 3 } });
    test.done();
};

exports.merge = function (test) {
    var a = { foo: 1, bar: 2 },
        b = { foo: 2 },
        out;

    out = helpers.merge(a, b);
    test.deepEqual(out, { foo: 2, bar: 2 }, 'returns merged object');
    test.deepEqual(a, { foo: 1, bar: 2 }, 'does not overwrite original object');

    test.done();
};
