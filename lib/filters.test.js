var expect = require('expect.js'),
  swig = require('../index'),
  DateZ = require('./dateformat').DateZ;

function testFilter(filter, input, output, message) {
  it(message, function () {
    var tpl = swig.compile('{{ v|' + filter + ' }}');
    expect(tpl(input)).to.eql(output);
  });
}

// Create dates for a particular timezone offset.
// For example, specifying 480 (offset in minutes) for tzOffset creates a date
// in your local timezone that is the same date as the specified y,m,d,h,i,s in PST.
function makeDate(tzOffset, y, m, d, h, i, s) {
  var date = new Date(y, m || 0, d || 0, h || 0, i || 0, s || 0),
    offset = date.getTimezoneOffset();

  if (offset !== tzOffset) { // timezone offset in PST for september
    date = new Date(date.getTime() - ((offset * 60000) - (tzOffset * 60000)));
  }

  return date;
}

describe('Filter', function () {
  before(function () {
    swig.init({ allowErrors: true });
  });

  describe('add', function () {
    testFilter('add(2)', { v: 1 }, '3', 'add numbers');
    testFilter('add(2)', { v: '1' }, '12', 'string number is not real number');
    testFilter('add([3, 4])', { v: [1, 2] }, '1,2,3,4', 'arrays add from literal');
    testFilter('add(b)', { v: [1, 2], b: [3, 4] }, '1,2,3,4', 'arrays add from var');
    testFilter('add(2)', { v: 'foo' }, 'foo2', 'string var turns addend into a string');
    testFilter('add("bar")', { v: 'foo' }, 'foobar', 'strings concatenated');
    testFilter('add({ bar: 2, baz: 3 })|join(",")', { v: { foo: 1 }}, '1,2,3', 'add objects from object literal');
    testFilter('add(b)|join(",")', { v: { foo: 1 }, b: { bar: 2 }}, '1,2', 'add objects from var');
    testFilter('add(b)', { v: 'foo', b: [1, 2] }, 'foo1,2', 'add array to string');
  });

  describe('addslashes', function () {
    testFilter('addslashes', { v: "\"Top O' the\\ mornin\"" }, "\\&quot;Top O\\&#39; the\\\\ mornin\\&quot;", 'add slashes to string');
    testFilter('addslashes', { v: ["\"Top", "O'", "the\\", "mornin\""] }, "\\\"Top,O\\',the\\\\,mornin\\\"", 'add slashes to array');
  });

  describe('capitalize', function () {
    testFilter('capitalize', { v: 'awesome sAuce.' }, 'Awesome sauce.');
    testFilter('capitalize', { v: 345 }, '345');
    testFilter('capitalize', { v: ['foo', 'bar'] }, 'Foo,Bar');
  });

  describe('date', function () {
    var date = makeDate(420, 2011, 8, 6, 9, 5, 2),
      tpl = swig.compile('{{ d|date("d", 420) }}');

    function testFormat(format, expected) {
      testFilter('date("' + format + '", 420)', { v: date }, expected, format);
    }
    // Day
    testFormat('d', '06');
    testFormat('D', 'Tue');
    testFormat('j', '6');
    testFormat('l', 'Tuesday');
    testFormat('N', '3');
    testFormat('S', 'th');
    testFormat('w', '2');
    testFormat('z', '248');
    testFilter('date("z", 480)', { v: makeDate(480, 2011, 0, 1) }, '0', 'z');
    testFilter('date("z", 480)', { v: makeDate(480, 2011, 11, 31) }, '364', 'z');

    // Week
    if (date.getTimezoneOffset() > -400) {
      // guaranteed to fail with the current test date in any timezone offset east of -400
      testFormat('W', '36');
    }

    // Month
    testFormat('F', 'September');
    testFormat('m', '09');
    testFormat('M', 'Sep');
    testFormat('n', '9');
    testFormat('t', '30');

    // Year
    testFormat('L', 'false');
    testFilter('date("L", 480)', { v: makeDate(480, 2008, 1, 29) }, 'true', 'L');
    testFormat('o', '2011');
    testFilter('date("o", 480)', { v: makeDate(480, 2011, 0, 1) }, '2010', 'o');
    testFormat('Y', '2011');
    testFormat('y', '11');

    // Time
    testFormat('a', 'am');
    testFormat('A', 'AM');
    testFormat('B', '712');
    testFormat('g', '9');
    testFormat('G', '9');
    testFormat('h', '09');
    testFilter('date("h", 480)', { v: makeDate(480, 2011, 0, 1, 10) }, '10', 'h');
    testFormat('H', '09');
    testFormat('i', '05');
    testFormat('s', '02');
    testFormat('d-m-Y', '06-09-2011');

    // Timezone
    testFormat('O', '+0700');
    testFormat('Z', '25200');
    testFilter('date("O", 360)', { v: date }, '+0600', 'O offset');
    testFilter('date("G", 320)', { v: date }, '10', 'G offset');

    // Full Date/Time
    testFormat('c', '2011-09-06T16:05:02.000Z');
    testFormat('r', 'Tue, 06 Sep 2011 16:05:02 GMT');
    testFormat('U', '1315325102');

    // More complete S ordinal testing
    testFilter('date("S", 420)', { v: makeDate(420, 2011, 8, 1) }, 'st', 'S 1st');
    testFilter('date("S", 420)', { v: makeDate(420, 2011, 8, 2) }, 'nd', 'S 2nd');
    testFilter('date("S", 420)', { v: makeDate(420, 2011, 8, 3) }, 'rd', 'S 3rd');
    testFilter('date("S", 420)', { v: makeDate(420, 2011, 8, 4) }, 'th', 'S 4th');
    testFilter('date("w", 420)', { v: makeDate(420, 2011, 8, 4) }, '0', 'w 0');
    testFilter('date("N", 420)', { v: makeDate(420, 2011, 8, 4) }, '7', 'N 7');
    testFilter('date("S", 420)', { v: makeDate(420, 2011, 8, 10) }, 'th', 'S 10th');
    testFilter('date("S", 420)', { v: makeDate(420, 2011, 8, 11) }, 'th', 'S 11th');
    testFilter('date("S", 420)', { v: makeDate(420, 2011, 8, 12) }, 'th', 'S 12th');
    testFilter('date("S", 420)', { v: makeDate(420, 2011, 8, 13) }, 'th', 'S 13th');
    testFilter('date("S", 420)', { v: makeDate(420, 2011, 8, 21) }, 'st', 'S 21st');
    testFilter('date("S", 420)', { v: makeDate(420, 2011, 8, 22) }, 'nd', 'S 22nd');
    testFilter('date("S", 420)', { v: makeDate(420, 2011, 8, 23) }, 'rd', 'S 23rd');

  });

  describe('date with global offset', function () {
    swig.init({
      allowErrors: true,
      tzOffset: 360
    });

    var tpl = swig.compile('{{ d|date("H:i:s") }}'),
      date = new Date(2011, 8, 6, 9, 20, 10),
      tzOffset = 480,
      offset = date.getTimezoneOffset();

    // make the date in PDT timezone
    if (offset !== tzOffset) {
      date = new Date(date.getTime() - ((offset * 60000) - (tzOffset * 60000)));
    }

    it('should return as same time in CDT, relative to PDT', function () {
      expect(swig.compile('{{ d|date("H:i:s") }}')({ d: date })).to.equal('10:20:10');
      expect(swig.compile('{{ d|date("H:i:s", 300) }}')({ d: date })).to.equal('12:20:10');
      expect(swig.compile('{{ d|date("H:i:s", -200) }}')({ d: date })).to.equal('20:40:10');
    });
  });

  describe('default', function () {
    testFilter('default("blah")', { v: 'foo' }, 'foo', 'string not overridden by default');
    testFilter('default("blah")', { v: 0 }, '0', 'zero not overridden by default');
    testFilter('default("blah")', { v: '' }, 'blah', 'empty string overridden by default');
    testFilter('default("blah")', {}, 'blah', 'default overrides undefined');
    testFilter('default("blah")', { v: null }, 'blah', 'default overrides null');
    testFilter('default("blah")', { v: false }, 'blah', 'default overrides false');
  });

  describe('e', function () {
    swig.init({ autoescape: true });
    testFilter('e', { v: '<&>' }, '&lt;&amp;&gt;', 'Unescaped output');
    testFilter('first|e', { v: ['<&>'] }, '&lt;&amp;&gt;', 'Unescaped in chain');
    testFilter('upper|e|lower', { v: '<&>fOo' }, '&lt;&amp;&gt;foo', 'Unescaped in middle of chain');
    testFilter('e("js")', { v: '"double quotes" and \'single quotes\'' }, '\\u0022double quotes\\u0022 and \\u0027single quotes\\u0027');
    testFilter('e("js")', { v: '<script>and this</script>' }, '\\u003Cscript\\u003Eand this\\u003C/script\\u003E');
    testFilter('e("js")', { v: '\\ : backslashes, too' }, '\\u005C : backslashes, too');
    testFilter('e("js")', { v: 'and lots of whitespace: \r\n\t\v\f\b' }, 'and lots of whitespace: \\u000D\\u000A\\u0009\\u000B\\u000C\\u0008');
    testFilter('e("js")', { v: 'and "special" chars = -1;' }, 'and \\u0022special\\u0022 chars \\u003D \\u002D1\\u003B');
    swig.init({});
  });

  describe('escape', function () {
    swig.init({ autoescape: true });
    testFilter('escape', { v: '<&>' }, '&lt;&amp;&gt;', 'Unescaped output');
    testFilter('first|escape', { v: ['<&>'] }, '&lt;&amp;&gt;', 'Unescaped in chain');
    testFilter('upper|escape|lower', { v: '<&>fOo' }, '&lt;&amp;&gt;foo', 'Unescaped in middle of chain');
    testFilter('escape("js")', { v: '"double quotes" and \'single quotes\'' }, '\\u0022double quotes\\u0022 and \\u0027single quotes\\u0027');
    testFilter('escape("js")', { v: '<script>and this</script>' }, '\\u003Cscript\\u003Eand this\\u003C/script\\u003E');
    testFilter('escape("js")', { v: '\\ : backslashes, too' }, '\\u005C : backslashes, too');
    testFilter('escape("js")', { v: 'and lots of whitespace: \r\n\t\v\f\b' }, 'and lots of whitespace: \\u000D\\u000A\\u0009\\u000B\\u000C\\u0008');
    testFilter('escape("js")', { v: 'and "special" chars = -1;' }, 'and \\u0022special\\u0022 chars \\u003D \\u002D1\\u003B');
    swig.init({});
  });

  describe('first', function () {
    testFilter('first', { v: [1, 2, 3, 4] }, '1', 'first from array');
    testFilter('first', { v: '213' }, '2', 'first in string');
    testFilter('first', { v: { foo: 'blah', bar: 'nope' }}, '', 'empty string from object');
  });

  describe('join', function () {
    testFilter('join("+")', { v: [1, 2, 3] }, '1+2+3', 'join with "+"');
    testFilter('join(" * ")', { v: [1, 2, 3] }, '1 * 2 * 3', 'join with " * "');
    testFilter('join(",")', { v: [1, 2, 3]}, '1,2,3', 'regression: join with a single comma');
    testFilter("join(',')", { v: [1, 2, 3]}, '1,2,3', 'regression: join with a single comma');
    testFilter('join(", ")', { v: { foo: 1, bar: 2, baz: 3 }}, '1, 2, 3', 'object values are joined');
    testFilter('join("-")', { v: 'asdf' }, 'asdf', 'Non-array input is not joined.');
  });

  describe('json_encode', function () {
    testFilter('json_encode', { v: { foo: 'bar', baz: [1, 2, 3] }}, '{&quot;foo&quot;:&quot;bar&quot;,&quot;baz&quot;:[1,2,3]}', 'default output');
    testFilter('json_encode(2)', { v: { foo: 'bar', baz: [1, 2, 3] }}, '{\n  &quot;foo&quot;: &quot;bar&quot;,\n  &quot;baz&quot;: [\n    1,\n    2,\n    3\n  ]\n}', 'can pretty-print');
  });

  describe('length', function () {
    testFilter('length', { v: [1, 2, 3] }, '3', 'array');
    testFilter('length', { v: 'foobar' }, '6', 'string');
    testFilter('length', { v: { 'h': 1, 'b': 2 }}, '2', 'object');
  });

  describe('last', function () {
    var input = [1, 2, 3, 4];
    testFilter('last', { v: [1, 2, 3, 4] }, '4', 'array');
    testFilter('last', { v: '123' }, '3', 'string');
    testFilter('last', { v: { foo: 'blah', bar: 'nope' }}, '', 'object');
  });

  describe('lower', function () {
    testFilter('lower', { v: 'BaR' }, 'bar', 'string');
    testFilter('lower', { v: '345' }, '345', 'number');
    testFilter('lower', { v: ['FOO', 'bAr'] }, 'foo,bar', 'array');
    testFilter('lower|join("")', { v: { foo: 'BAR' } }, 'bar', 'object');
  });

  describe('raw', function () {
    testFilter('raw', { v: '<&>' }, '<&>', 'Unescaped output');
    testFilter('first|raw', { v: ['<&>'] }, '<&>', 'Unescaped in chain');
    testFilter('upper|raw|lower', { v: '<&>fOo' }, '<&>foo', 'Unescaped in middle of chain');
  });

  describe('replace', function () {
    testFilter('replace("o", "a")', { v: 'foo' }, 'fao', 'basic replace first found instance');
    testFilter('replace("o", "", "g")', { v: 'fooboo' }, 'fb', 'g flag replaces all instances');
    testFilter('replace("\\W+", "-")', { v: '$*&1aZ' }, '-1aZ', 'accepts a regular expression');
  });

  describe('reverse', function () {
    testFilter('reverse', { v: [1, 2, 3] }, '3,2,1', 'reverse array');
    testFilter('reverse', { v: 'asdf' }, 'asdf', 'reverse string does nothing');
    testFilter('reverse|join("")', { v: { foo: 'bar', baz: 'bop' }}, 'barbop', 'reverse object does nothing');
  });

  describe('striptags', function () {
    var input = '<h1>foo</h1> <div class="blah">hi</div>';
    testFilter('striptags', { v: '<h1>foo</h1> <div class="blah">hi</div>' }, 'foo hi', 'string');
  });

  describe('title', function () {
    var input = 'this is title case';
    testFilter('title', { v: 'this is title case' }, 'This Is Title Case', 'plain');
  });

  describe('uniq', function () {
    testFilter('uniq', { v: [2, 1, 2, 3, 4, 4] }, '2,1,3,4', 'removes duplicate values');
  });

  describe('upper', function () {
    testFilter('upper', { v: 'bar' }, 'BAR', 'string');
    testFilter('upper', { v: 345 }, '345', 'number');
    testFilter('upper', { v: ['foo', 'bAr'] }, 'FOO,BAR', 'array');
    testFilter('upper|join("")', { v: { foo: 'bar' } }, 'BAR', 'object');
  });

  describe('url_encode', function () {
    testFilter('url_encode', { v: "param=1&anotherParam=2" }, "param%3D1%26anotherParam%3D2", 'encodes urls');
  });

  describe('url_decode', function () {
    var input = "param%3D1%26anotherParam%3D2";
    testFilter('url_decode', { v: "param%3D1%26anotherParam%3D2" }, "param=1&amp;anotherParam=2", 'decodes urls');
  });

});
