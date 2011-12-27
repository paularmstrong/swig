var swig = require('../index');

swig.init({});

function testFilter(test, filter, input, output, message) {
    var tpl = swig.compile('{{ v|' + filter + ' }}');
    test.strictEqual(tpl(input), output, message);
}

exports.add = function (test) {
    testFilter(test, 'add(2)', { v: 1 }, '3', 'add numbers');
    testFilter(test, 'add(2)', { v: '1' }, '12', 'string number is not real number');
    testFilter(test, 'add([3, 4])', { v: [1, 2] }, '1,2,3,4', 'arrays add from literal');
    testFilter(test, 'add(b)', { v: [1, 2], b: [3, 4] }, '1,2,3,4', 'arrays add from var');
    testFilter(test, 'add(2)', { v: 'foo' }, 'foo2', 'string var turns addend into a string');
    testFilter(test, 'add("bar")', { v: 'foo' }, 'foobar', 'strings concatenated');
    testFilter(test, 'add({ bar: 2, baz: 3 })|join(",")', { v: { foo: 1 }}, '1,2,3', 'add objects from object literal');
    testFilter(test, 'add(b)|join(",")', { v: { foo: 1 }, b: { bar: 2 }}, '1,2', 'add objects from var');
    testFilter(test, 'add(b)', { v: 'foo', b: [1, 2] }, 'foo1,2', 'add array to string');
    test.done();
};

exports.addslashes = function (test) {
    testFilter(test, 'addslashes', { v: "\"Top O' the\\ mornin\"" }, "\\&quot;Top O\\&#39; the\\\\ mornin\\&quot;", 'add slashes to string');
    testFilter(test, 'addslashes', { v: ["\"Top", "O'", "the\\", "mornin\""] }, "\\\"Top,O\\',the\\\\,mornin\\\"", 'add slashes to array');
    test.done();
};

exports.capitalize = function (test) {
    testFilter(test, 'capitalize', { v: 'awesome sAuce.' }, 'Awesome sauce.');
    testFilter(test, 'capitalize', { v: 345 }, '345');
    testFilter(test, 'capitalize', { v: ['foo', 'bar'] }, 'Foo,Bar');
    test.done();
};

exports.date = function (test) {
    var date = new Date(2011, 8, 6, 9, 5, 2),
        tpl = swig.compile('{{ d|date("d") }}');

    date.setUTCHours(16);

    function testFormat(format, expected) {
        testFilter(test, 'date("' + format + '")', { v: date }, expected);
    }
    // Day
    testFormat('d', '06');
    testFormat('D', 'Tue');
    testFormat('j', '6');
    testFormat('l', 'Tuesday');
    testFormat('N', '2');
    testFormat('S', 'th');
    testFormat('w', '1');
    testFormat('z', '248');
    testFilter(test, 'date("z")', { v: new Date(2011, 0, 1) }, '0');
    testFilter(test, 'date("z")', { v: new Date(2011, 11, 31) }, '364');

    // Week
    testFormat('W', '36');

    // Month
    testFormat('F', 'September');
    testFormat('m', '09');
    testFormat('M', 'Sep');
    testFormat('n', '9');
    testFormat('t', '30');

    // Year
    testFormat('L', 'false');
    testFilter(test, 'date("L")', { v: new Date(2008, 1, 29) }, 'true');
    testFormat('o', '2011');
    testFilter(test, 'date("o")', { v: new Date(2011, 0, 1) }, '2010');
    testFormat('Y', '2011');
    testFormat('y', '11');

    // Time
    testFormat('a', 'am');
    testFormat('A', 'AM');
    testFormat('B', '712');
    testFormat('g', '9');
    testFormat('G', '9');
    testFormat('h', '09');
    testFilter(test, 'date("h")', { v: new Date(2011, 0, 1, 10) }, '10');
    testFormat('H', '09');
    testFormat('i', '05');
    testFormat('s', '02');
    testFormat('d-m-Y', '06-09-2011');

    // These tests will fail in any other timezone. It's a bit hard to fake that out without directly implementing the methods inline.
    // Timezone
    testFormat('O', '+0700');
    testFormat('Z', '25200');

    // Full Date/Time
    testFormat('c', '2011-09-06T16:05:02.000Z');
    testFormat('r', 'Tue, 06 Sep 2011 16:05:02 GMT');
    testFormat('U', '1315325102');

    test.done();
};

exports['default'] = function (test) {
    testFilter(test, 'default("blah")', { v: 'foo' }, 'foo', 'string not overridden by default');
    testFilter(test, 'default("blah")', { v: 0 }, '0', 'zero not overridden by default');
    testFilter(test, 'default("blah")', { v: '' }, 'blah', 'empty string overridden by default');
    testFilter(test, 'default("blah")', {}, 'blah', 'default overrides undefined');
    testFilter(test, 'default("blah")', { v: null }, 'blah', 'default overrides null');
    testFilter(test, 'default("blah")', { v: false }, 'blah', 'default overrides false');
    test.done();
};

exports.e = function (test) {
    swig.init({ autoescape: true });
    testFilter(test, 'e', { v: '<&>' }, '&lt;&amp;&gt;', 'Unescaped output');
    testFilter(test, 'first|e', { v: ['<&>'] }, '&lt;&amp;&gt;', 'Unescaped in chain');
    testFilter(test, 'upper|e|lower', { v: '<&>fOo' }, '&lt;&amp;&gt;foo', 'Unescaped in middle of chain');
    testFilter(test, 'e("js")', { v: '"double quotes" and \'single quotes\'' }, '\\u0022double quotes\\u0022 and \\u0027single quotes\\u0027');
    testFilter(test, 'e("js")', { v: '<script>and this</script>' }, '\\u003Cscript\\u003Eand this\\u003C/script\\u003E');
    testFilter(test, 'e("js")', { v: '\\ : backslashes, too' }, '\\u005C : backslashes, too');
    testFilter(test, 'e("js")', { v: 'and lots of whitespace: \r\n\t\v\f\b' }, 'and lots of whitespace: \\u000D\\u000A\\u0009\\u000B\\u000C\\u0008');
    testFilter(test, 'e("js")', { v: 'and "special" chars = -1;' }, 'and \\u0022special\\u0022 chars \\u003D \\u002D1\\u003B');
    swig.init({});
    test.done();
};

exports.escape = function (test) {
    swig.init({ autoescape: true });
    testFilter(test, 'escape', { v: '<&>' }, '&lt;&amp;&gt;', 'Unescaped output');
    testFilter(test, 'first|escape', { v: ['<&>'] }, '&lt;&amp;&gt;', 'Unescaped in chain');
    testFilter(test, 'upper|escape|lower', { v: '<&>fOo' }, '&lt;&amp;&gt;foo', 'Unescaped in middle of chain');
    testFilter(test, 'escape("js")', { v: '"double quotes" and \'single quotes\'' }, '\\u0022double quotes\\u0022 and \\u0027single quotes\\u0027');
    testFilter(test, 'escape("js")', { v: '<script>and this</script>' }, '\\u003Cscript\\u003Eand this\\u003C/script\\u003E');
    testFilter(test, 'escape("js")', { v: '\\ : backslashes, too' }, '\\u005C : backslashes, too');
    testFilter(test, 'escape("js")', { v: 'and lots of whitespace: \r\n\t\v\f\b' }, 'and lots of whitespace: \\u000D\\u000A\\u0009\\u000B\\u000C\\u0008');
    testFilter(test, 'escape("js")', { v: 'and "special" chars = -1;' }, 'and \\u0022special\\u0022 chars \\u003D \\u002D1\\u003B');
    swig.init({});
    test.done();
};

exports.first = function (test) {
    testFilter(test, 'first', { v: [1, 2, 3, 4] }, '1', 'first from array');
    testFilter(test, 'first', { v: '213' }, '2', 'first in string');
    testFilter(test, 'first', { v: { foo: 'blah', bar: 'nope' }}, '', 'empty string from object');
    test.done();
};

exports.join = function (test) {
    testFilter(test, 'join("+")', { v: [1, 2, 3] }, '1+2+3', 'join with "+"');
    testFilter(test, 'join(" * ")', { v: [1, 2, 3] }, '1 * 2 * 3', 'join with " * "');
    testFilter(test, 'join(",")', { v: [1, 2, 3]}, '1,2,3', 'regression: join with a single comma');
    testFilter(test, "join(',')", { v: [1, 2, 3]}, '1,2,3', 'regression: join with a single comma');
    testFilter(test, 'join(", ")', { v: { foo: 1, bar: 2, baz: 3 }}, '1, 2, 3', 'object values are joined');
    testFilter(test, 'join("-")', { v: 'asdf' }, 'asdf', 'Non-array input is not joined.');
    test.done();
};

exports.json_encode = function (test) {
    testFilter(test, 'json_encode', { v: { foo: 'bar', baz: [1, 2, 3] }}, '{&quot;foo&quot;:&quot;bar&quot;,&quot;baz&quot;:[1,2,3]}');
    test.done();
};

exports.length = function (test) {
    testFilter(test, 'length', { v: [1, 2, 3] }, '3', 'array');
    testFilter(test, 'length', { v: 'foobar' }, '6', 'string');
    testFilter(test, 'length', { v: { 'h': 1, 'b': 2 }}, '2', 'object');
    test.done();
};

exports.last = function (test) {
    var input = [1, 2, 3, 4];
    testFilter(test, 'last', { v: [1, 2, 3, 4] }, '4', 'array');
    testFilter(test, 'last', { v: '123' }, '3', 'string');
    testFilter(test, 'last', { v: { foo: 'blah', bar: 'nope' }}, '', 'object');
    test.done();
};

exports.lower = function (test) {
    testFilter(test, 'lower', { v: 'BaR' }, 'bar', 'string');
    testFilter(test, 'lower', { v: '345' }, '345', 'number');
    testFilter(test, 'lower', { v: ['FOO', 'bAr'] }, 'foo,bar', 'array');
    testFilter(test, 'lower|join("")', { v: { foo: 'BAR' } }, 'bar', 'object');
    test.done();
};

exports.raw = function (test) {
    testFilter(test, 'raw', { v: '<&>' }, '<&>', 'Unescaped output');
    testFilter(test, 'first|raw', { v: ['<&>'] }, '<&>', 'Unescaped in chain');
    testFilter(test, 'upper|raw|lower', { v: '<&>fOo' }, '<&>foo', 'Unescaped in middle of chain');
    test.done();
};

exports.replace = function (test) {
    testFilter(test, 'replace("o", "", "g")', { v: 'fooboo' }, 'fb');
    testFilter(test, 'replace("o", "a")', { v: 'foo' }, 'fao');
    testFilter(test, 'replace("\\W+", "-")', { v: '$*&1aZ' }, '-1aZ');
    test.done();
};

exports.reverse = function (test) {
    testFilter(test, 'reverse', { v: [1, 2, 3] }, '3,2,1', 'reverse array');
    testFilter(test, 'reverse', { v: 'asdf' }, 'asdf', 'reverse string does nothing');
    testFilter(test, 'reverse|join("")', { v: { foo: 'bar', baz: 'bop' }}, 'barbop', 'reverse object does nothing');
    test.done();
};

exports.striptags = function (test) {
    var input = '<h1>foo</h1> <div class="blah">hi</div>';
    testFilter(test, 'striptags', { v: '<h1>foo</h1> <div class="blah">hi</div>' }, 'foo hi', 'string');
    testFilter(test, 'striptags|join(",")', { v: ['<h1>foo</h1>', '<div class="blah">hi</div>'] }, 'foo,hi', 'array');
    testFilter(test, 'striptags|join(",")', { v: { foo: '<h1>foo</h1>', bar: '<div class="blah">hi</div>' }}, 'foo,hi', 'object');
    test.done();
};

exports.title = function (test) {
    var input = 'this is title case';
    testFilter(test, 'title', { v: 'this is title case' }, 'This Is Title Case', 'string');
    testFilter(test, 'title|join(",")', { v: ['foo bar', 'blaHbiTTy bLAH'] }, 'Foo Bar,Blahbitty Blah');
    testFilter(test, 'title|join(",")', { v: { foo: 'foo bar', bar: 'blaHbiTTy bLAH' } }, 'Foo Bar,Blahbitty Blah');
    test.done();
};

exports.uniq = function (test) {
    testFilter(test, 'uniq', { v: [2, 1, 2, 3, 4, 4] }, '2,1,3,4');
    test.done();
};

exports.upper = function (test) {
    testFilter(test, 'upper', { v: 'bar' }, 'BAR', 'string');
    testFilter(test, 'upper', { v: 345 }, '345', 'number');
    testFilter(test, 'upper', { v: ['foo', 'bAr'] }, 'FOO,BAR', 'array');
    testFilter(test, 'upper|join("")', { v: { foo: 'bar' } }, 'BAR', 'object');
    test.done();
};

exports.url_encode = function (test) {
    testFilter(test, 'url_encode', { v: "param=1&anotherParam=2" }, "param%3D1%26anotherParam%3D2");
    test.done();
};

exports.url_decode = function (test) {
    var input = "param%3D1%26anotherParam%3D2";
    testFilter(test, 'url_decode', { v: "param%3D1%26anotherParam%3D2" }, "param=1&amp;anotherParam=2");
    test.done();
};
