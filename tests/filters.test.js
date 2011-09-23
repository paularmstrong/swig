var filters = require('../lib/filters');

exports.add = function (test) {
    test.strictEqual(2, filters.add(0, 2));
    test.strictEqual(3, filters.add('1', 2));
    test.deepEqual([1, 2, 3, 4], filters.add([1, 2], [3, 4]));
    test.strictEqual('foo2', filters.add('foo', 2));
    test.strictEqual('foobar', filters.add('foo', 'bar'));
    test.deepEqual({ foo: 1, bar: 2 }, filters.add({ foo: 1 }, { bar: 2 }));
    test.strictEqual('foo1,2', filters.add('foo', [1, 2]));
    test.done();
};

exports.addslashes = function (test) {
    test.strictEqual("\\\"Top O\\' the\\\\ mornin\\\"", filters.addslashes("\"Top O' the\\ mornin\""));
    test.done();
};

exports.capitalize = function (test) {
    var input = 'awesome sauce.';
    test.strictEqual('Awesome sauce.', filters.capitalize(input));
    input = 345;
    test.strictEqual('345', filters.capitalize(input));
    test.done();
};

exports.date = function (test) {
    var input = 'Tue Sep 06 2011 09:05:02';

    // Day
    test.strictEqual('06', filters.date(input, "d"), 'format: d http://www.php.net/date');
    test.strictEqual('Tue', filters.date(input, "D"), 'format: D http://www.php.net/date');
    test.strictEqual('6', filters.date(input, "j"), 'format: j http://www.php.net/date');
    test.strictEqual('Tuesday', filters.date(input, "l"), 'format: l http://www.php.net/date');
    test.strictEqual('2', filters.date(input, "N"), 'format: N http://www.php.net/date');
    test.strictEqual('th', filters.date(input, "S"), 'format: S http://www.php.net/date');
    test.strictEqual('1', filters.date(input, "w"), 'format: w http://www.php.net/date');

    // Month
    test.strictEqual('September', filters.date(input, "F"), 'format: F http://www.php.net/date');
    test.strictEqual('09', filters.date(input, "m"), 'format: m http://www.php.net/date');
    test.strictEqual('Sep', filters.date(input, "M"), 'format: M http://www.php.net/date');
    test.strictEqual('9', filters.date(input, "n"), 'format: n http://www.php.net/date');

    // Year
    test.strictEqual('2011', filters.date(input, "Y"), 'format: Y http://www.php.net/date');
    test.strictEqual('11', filters.date(input, "y"), 'format: y http://www.php.net/date');
    test.strictEqual('2011', filters.date(input, "Y"), 'format: Y http://www.php.net/date');

    // Time
    test.strictEqual('am', filters.date(input, "a"), 'format: a http://www.php.net/date');
    test.strictEqual('AM', filters.date(input, "A"), 'format: A http://www.php.net/date');
    test.strictEqual('9', filters.date(input, "g"), 'format: g http://www.php.net/date');
    test.strictEqual('9', filters.date(input, "G"), 'format: G http://www.php.net/date');
    test.strictEqual('09', filters.date(input, "h"), 'format: h http://www.php.net/date');
    test.strictEqual('09', filters.date(input, "H"), 'format: H http://www.php.net/date');
    test.strictEqual('05', filters.date(input, "i"), 'format: i http://www.php.net/date');
    test.strictEqual('02', filters.date(input, "s"), 'format: s http://www.php.net/date');

    test.strictEqual('06-09-2011', filters.date(input, "d-m-Y"));

    // These tests will fail in any other timezone. It's a bit hard to fake that out without directly implementing the methods inline.
    // Timezone
    test.strictEqual('+0700', filters.date(input, "O"), 'format: O http://www.php.net/date');
    test.strictEqual('25200', filters.date(input, "Z"), 'format: Z http://www.php.net/date');

    // Full Date/Time
    test.strictEqual('Tue Sep 06 2011 09:05:02 GMT-0700 (PDT)', filters.date(input, "r"), 'format: r http://www.php.net/date');
    test.strictEqual('1315325102', filters.date(input, "U"), 'format: U http://www.php.net/date');

    test.done();
};

exports.default = function (test) {
    var defOut = 'blah';
    test.strictEqual('foo', filters.default('foo', defOut), 'string not overridden by default');
    test.strictEqual(0, filters.default(0, defOut), 'zero not overridden by default');

    test.strictEqual(defOut, filters.default('', defOut), 'empty string overridden by default');
    test.strictEqual(defOut, filters.default(undefined, defOut), 'default overrides undefined');
    test.strictEqual(defOut, filters.default(null, defOut), 'default overrides null');
    test.strictEqual(defOut, filters.default(false, defOut), 'default overrides false');
    test.done();
};

exports.first = function (test) {
    test.strictEqual(1, filters.first([1, 2, 3, 4]));
    test.strictEqual('2', filters.first('213'));
    test.strictEqual('', filters.first({ foo: 'blah', bar: 'nope' }));
    test.done();
};

exports.join = function (test) {
    var input = [1, 2, 3];
    test.strictEqual('1+2+3', filters.join(input, '+'));
    test.strictEqual('1 * 2 * 3', filters.join(input, ' * '));
    test.deepEqual({ foo: 1, bar: 2, baz: 3 }, filters.join({ foo: 1, bar: 2, baz: 3 }, ','));
    test.strictEqual('asdf', filters.join('asdf', '-'), 'Non-array input is not joined.');
    test.done();
};

exports.json_encode = function (test) {
    var input = { foo: 'bar', baz: [1, 2, 3] };
    test.strictEqual('{"foo":"bar","baz":[1,2,3]}', filters.json_encode(input));
    test.done();
};

exports.length = function (test) {
    test.strictEqual(3, filters.length([1, 2, 3]));
    test.strictEqual(6, filters.length('foobar'));
    test.strictEqual(2, filters.length({ 'h': 1, 'b': 2 }));
    test.done();
};

exports.last = function (test) {
    var input = [1, 2, 3, 4];
    test.strictEqual(4, filters.last(input));
    test.strictEqual('3', filters.last('123'));
    test.strictEqual('', filters.last({ foo: 'blah', bar: 'nope' }));
    test.done();
};

exports.lower = function (test) {
    test.strictEqual('bar', filters.lower('BaR'));
    test.strictEqual('345', filters.lower(345));
    test.deepEqual(['foo', 'bar'], filters.lower(['FOO', 'BAR']));
    test.deepEqual({ foo: 'bar' }, filters.lower({ foo: 'BAR' }));
    test.done();
};

exports.replace = function (test) {
    test.strictEqual('fb', filters.replace('fooboo', 'o', '', 'g'));
    test.strictEqual('fao', filters.replace('foo', 'o', 'a'));
    test.strictEqual('-1aZ', filters.replace('$*&1aZ', '\\W+', '-'));
    test.done();
};

exports.reverse = function (test) {
    test.deepEqual([3, 2, 1], filters.reverse([1, 2, 3]), 'reverse array');
    test.strictEqual('asdf', filters.reverse('asdf'), 'reverse string does nothing');
    test.deepEqual({ 'foo': 'bar' }, filters.reverse({ 'foo': 'bar' }), 'reverse object does nothing');
    test.done();
};

exports.striptags = function (test) {
    var input = '<h1>foo</h1> <div class="blah">hi</div>';
    test.strictEqual('foo hi', filters.striptags(input));
    test.deepEqual(['foo', 'hi'], filters.striptags(['<h1>foo</h1>', '<div class="blah">hi</div>']));
    test.deepEqual({ foo: 'foo', bar: 'hi' }, filters.striptags({ foo: '<h1>foo</h1>', bar: '<div class="blah">hi</div>' }));
    test.done();
};

exports.title = function (test) {
    var input = 'this is title case';
    test.strictEqual('This Is Title Case', filters.title(input));
    test.deepEqual(['Foo Bar', 'Blahbitty Blah'], filters.title(['foo bar', 'blaHbiTTy bLAH']));
    test.deepEqual({ foo: 'Foo Bar', bar: 'Blahbitty Blah' }, filters.title({ foo: 'foo bar', bar: 'blaHbiTTy bLAH' }));
    test.done();
};

exports.uniq = function (test) {
    var input = [2, 1, 2, 3, 4, 4];
    test.deepEqual([2, 1, 3, 4], filters.uniq(input));
    test.done();
};
exports.upper = function (test) {
    test.strictEqual('BAR', filters.upper('bar'));
    test.strictEqual('345', filters.upper(345));
    test.deepEqual(['FOO', 'BAR'], filters.upper(['foo', 'bar']));
    test.deepEqual({ foo: 'BAR' }, filters.upper({ foo: 'bar' }));
    test.done();
};

exports.url_encode = function (test) {
    var input = "param=1&anotherParam=2";
    test.strictEqual("param%3D1%26anotherParam%3D2", filters.url_encode(input));
    test.done();
};

exports.url_decode = function (test) {
    var input = "param%3D1%26anotherParam%3D2";
    test.strictEqual("param=1&anotherParam=2", filters.url_decode(input));
    test.done();
};
