var filters = require('../lib/filters');

exports.lower = function (test) {
    var input = 'BaR';
    test.strictEqual('bar', filters.lower(input));
    input = 345;
    test.strictEqual('345', filters.lower(input));
    test.done();
};

exports.upper = function (test) {
    var input = 'bar';
    test.strictEqual('BAR', filters.upper(input));
    input = 345;
    test.strictEqual('345', filters.upper(input));
    test.done();
};

exports.capitalize = function (test) {
    var input = 'awesome sauce.';
    test.strictEqual('Awesome sauce.', filters.capitalize(input));
    input = 345;
    test.strictEqual('345', filters.capitalize(input));
    test.done();
};

exports.title = function (test) {
    var input = 'this is title case';
    test.strictEqual('This Is Title Case', filters.title(input));
    test.done();
};

exports.join = function (test) {
    var input = [1, 2, 3];
    test.strictEqual('1+2+3', filters.join(input, '+'));
    test.strictEqual('1 * 2 * 3', filters.join(input, ' * '));
    input = 'asdf';
    test.strictEqual('asdf', filters.join(input, '-'), 'Non-array input is not joined.');
    test.done();
};

exports.length = function (test) {
    var input = [1, 2, 3];
    test.strictEqual(3, filters.length(input));
    input = 'foobar';
    test.strictEqual(6, filters.length(input));
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

exports.json_encode = function (test) {
    var input = { foo: 'bar', baz: [1, 2, 3] };
    test.strictEqual('{"foo":"bar","baz":[1,2,3]}', filters.json_encode(input));
    test.done();
};

exports.striptags = function (test) {
    var input = '<h1>foo</h1> <div class="blah">hi</div>';
    test.strictEqual('foo hi', filters.striptags(input));
    test.done();
};

exports.multiple = function (test) {
    var input = ['aWEsoMe', 'sAuCe'];
    test.strictEqual('Awesome Sauce', filters.title(filters.join(input, ' ')));
    test.done();
};

exports.date = function (test) {
    var input = 'Sat Aug 06 2011 09:05:02 GMT-0700 (PDT)';

    test.strictEqual('06', filters.date(input, "d"), 'format: d http://www.php.net/date');
    test.strictEqual('Sat', filters.date(input, "D"), 'format: D http://www.php.net/date');
    test.strictEqual('6', filters.date(input, "j"), 'format: j http://www.php.net/date');
    test.strictEqual('Saturday', filters.date(input, "l"), 'format: l http://www.php.net/date');
    test.strictEqual('6', filters.date(input, "N"), 'format: N http://www.php.net/date');
    test.strictEqual('th', filters.date(input, "S"), 'format: S http://www.php.net/date');
    test.strictEqual('5', filters.date(input, "w"), 'format: w http://www.php.net/date');
    test.strictEqual('August', filters.date(input, "F"), 'format: F http://www.php.net/date');
    test.strictEqual('08', filters.date(input, "m"), 'format: m http://www.php.net/date');
    test.strictEqual('Aug', filters.date(input, "M"), 'format: M http://www.php.net/date');
    test.strictEqual('8', filters.date(input, "n"), 'format: n http://www.php.net/date');

    test.strictEqual('2011', filters.date(input, "Y"), 'format: Y http://www.php.net/date');
    test.strictEqual('11', filters.date(input, "y"), 'format: y http://www.php.net/date');
    test.strictEqual('2011', filters.date(input, "Y"), 'format: Y http://www.php.net/date');
    test.strictEqual('am', filters.date(input, "a"), 'format: a http://www.php.net/date');
    test.strictEqual('AM', filters.date(input, "A"), 'format: A http://www.php.net/date');
    test.strictEqual('9', filters.date(input, "g"), 'format: g http://www.php.net/date');
    test.strictEqual('9', filters.date(input, "G"), 'format: G http://www.php.net/date');
    test.strictEqual('09', filters.date(input, "h"), 'format: h http://www.php.net/date');
    test.strictEqual('09', filters.date(input, "H"), 'format: H http://www.php.net/date');
    test.strictEqual('05', filters.date(input, "i"), 'format: i http://www.php.net/date');
    test.strictEqual('02', filters.date(input, "s"), 'format: s http://www.php.net/date');

    test.strictEqual('+0700', filters.date(input, "O"), 'format: O http://www.php.net/date');
    test.strictEqual('25200', filters.date(input, "Z"), 'format: Z http://www.php.net/date');
    test.strictEqual('Sat Aug 06 2011 09:05:02 GMT-0700 (PDT)', filters.date(input, "r"), 'format: r http://www.php.net/date');
    test.strictEqual('1312646702', filters.date(input, "U"), 'format: U http://www.php.net/date');

    test.strictEqual('06-08-2011', filters.date(input, "d-m-Y"));

    test.done();
};
