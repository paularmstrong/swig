var testCase = require('nodeunit').testCase,
    filters = require('../lib/filters');

exports.lower = function (test) {
    var input = 'BaR';
    test.strictEqual('bar', eval(filters.wrap('input', ['lower'])));
    input = 345;
    test.strictEqual('345', eval(filters.wrap('input', ['lower'])));
    test.done();
};

exports.upper = function (test) {
    var input = 'bar';
    test.strictEqual('BAR', eval(filters.wrap('input', ['upper'])));
    input = 345;
    test.strictEqual('345', eval(filters.wrap('input', ['upper'])));
    test.done();
};

exports.capitalize = function (test) {
    var input = 'awesome sauce.';
    test.strictEqual('Awesome sauce.', eval(filters.wrap('input', ['capitalize'])));
    input = 345;
    test.strictEqual('345', eval(filters.wrap('input', ['capitalize'])));
    test.done();
};

exports.title = function (test) {
    var input = 'This Is Title Case';
    test.strictEqual('This Is Title Case', eval(filters.wrap('input', ['title'])));
    test.done();
};

exports.join = function (test) {
    var input = [1, 2, 3];
    test.strictEqual('1+2+3', eval(filters.wrap('input', ['join(\'+\')'])));
    test.strictEqual('1 * 2 * 3', eval(filters.wrap('input', ['join(\' * \')'])));
    input = 'asdf';
    test.strictEqual('asdf', eval(filters.wrap('input', ['join(\'-\')'])), 'Non-array input is not joined.');
    test.done();
};

exports.length = function (test) {
    var input = [1, 2, 3];
    test.strictEqual(3, eval(filters.wrap('input', ['length'])));
    input = 'foobar';
    test.strictEqual(6, eval(filters.wrap('input', ['length'])));
    test.done();
};

exports.multiple = function (test) {
    var input = ['aWEsoMe', 'sAuCe'];
    test.strictEqual('Awesome Sauce', eval(filters.wrap('input', ['join(\' \')', 'title'])));
    test.done();
};
