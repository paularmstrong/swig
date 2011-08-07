var filters = require('../lib/filters');

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
    var input = 'this is title case';
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

exports.url_encode = function (test) {
    var input = "param=1&anotherParam=2";
    test.strictEqual("param%3D1%26anotherParam%3D2", eval(filters.wrap('input', ['url_encode'])));
    test.done();
};

exports.url_decode = function (test) {
    var input = "param%3D1%26anotherParam%3D2";
    test.strictEqual("param=1&anotherParam=2", eval(filters.wrap('input', ['url_decode'])));
    test.done();
};

exports.json_encode = function (test) {
    var input = { foo: 'bar', baz: [1, 2, 3] };
    test.strictEqual('{"foo":"bar","baz":[1,2,3]}', eval(filters.wrap('input', ['json_encode'])));
    test.done();
};

exports.striptags = function (test) {
    var input = '<h1>foo</h1> <div class="blah">hi</div>';
    test.strictEqual('foo hi', eval(filters.wrap('input', ['striptags'])));
    test.done();
};

exports.multiple = function (test) {
    var input = ['aWEsoMe', 'sAuCe'];
    test.strictEqual('Awesome Sauce', eval(filters.wrap('input', ['join(\' \')', 'title'])));
    test.done();
};

exports.date = function (test) {
    var input = 'Sat Aug 06 2011 09:05:02 GMT-0700 (PDT)';

    test.strictEqual('06', eval(filters.wrap('input', ['date("d")'])), 'format: d http://www.php.net/date');
    // test.strictEqual('Sat', eval(filters.wrap('input', ['date("D")'])), 'format: D http://www.php.net/date');
    test.strictEqual('6', eval(filters.wrap('input', ['date("j")'])), 'format: j http://www.php.net/date');
    // test.strictEqual('Saturday', eval(filters.wrap('input', ['date("l")'])), 'format: l http://www.php.net/date');
    test.strictEqual('6', eval(filters.wrap('input', ['date("N")'])), 'format: N http://www.php.net/date');
    test.strictEqual('th', eval(filters.wrap('input', ['date("S")'])), 'format: S http://www.php.net/date');
    test.strictEqual('5', eval(filters.wrap('input', ['date("w")'])), 'format: w http://www.php.net/date');
    // test.strictEqual('August', eval(filters.wrap('input', ['date("F")'])), 'format: F http://www.php.net/date');
    test.strictEqual('08', eval(filters.wrap('input', ['date("m")'])), 'format: m http://www.php.net/date');
    // test.strictEqual('Aug', eval(filters.wrap('input', ['date("M")'])), 'format: M http://www.php.net/date');
    test.strictEqual('8', eval(filters.wrap('input', ['date("n")'])), 'format: n http://www.php.net/date');

    test.strictEqual('2011', eval(filters.wrap('input', ['date("Y")'])), 'format: Y http://www.php.net/date');
    test.strictEqual('11', eval(filters.wrap('input', ['date("y")'])), 'format: y http://www.php.net/date');
    test.strictEqual('2011', eval(filters.wrap('input', ['date("Y")'])), 'format: Y http://www.php.net/date');
    test.strictEqual('am', eval(filters.wrap('input', ['date("a")'])), 'format: a http://www.php.net/date');
    test.strictEqual('AM', eval(filters.wrap('input', ['date("A")'])), 'format: A http://www.php.net/date');
    test.strictEqual('9', eval(filters.wrap('input', ['date("g")'])), 'format: g http://www.php.net/date');
    test.strictEqual('9', eval(filters.wrap('input', ['date("G")'])), 'format: G http://www.php.net/date');
    test.strictEqual('09', eval(filters.wrap('input', ['date("h")'])), 'format: h http://www.php.net/date');
    test.strictEqual('09', eval(filters.wrap('input', ['date("H")'])), 'format: H http://www.php.net/date');
    test.strictEqual('05', eval(filters.wrap('input', ['date("i")'])), 'format: i http://www.php.net/date');
    test.strictEqual('02', eval(filters.wrap('input', ['date("s")'])), 'format: s http://www.php.net/date');

    test.strictEqual('+0700', eval(filters.wrap('input', ['date("O")'])), 'format: O http://www.php.net/date');
    test.strictEqual('25200', eval(filters.wrap('input', ['date("Z")'])), 'format: Z http://www.php.net/date');
    test.strictEqual('Sat Aug 06 2011 09:05:02 GMT-0700 (PDT)', eval(filters.wrap('input', ['date("r")'])), 'format: r http://www.php.net/date');
    test.strictEqual('1312646702', eval(filters.wrap('input', ['date("U")'])), 'format: U http://www.php.net/date');

    test.done();
};