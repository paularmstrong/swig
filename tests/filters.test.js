var swig = require('../lib/swig'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;


function makeDate(tzOffset, y, m, d, h, i, s) {
  var date = new Date(y, m || 0, d || 0, h || 0, i || 0, s || 0),
    offset = date.getTimezoneOffset();

  if (offset !== tzOffset) { // timezone offset in PST for september
    date = new Date(date.getTime() - ((offset * 60000) - (tzOffset * 60000)));
  }

  return date;
}

var n = new Swig(),
  oDefaults = n.options,
  d = makeDate(420, 2011, 8, 6, 9, 5, 2),
  cases = {
    addslashes: [
      {
        v: "\"Top O' the\\ mornin\"",
        e: "\\&quot;Top O\\&#39; the\\\\ mornin\\&quot;"
      },
      {
        c: 'v|addslashes|raw',
        v: ["\"Top", "O'", "the\\", "mornin\""],
        e: '\\"Top,O\\\',the\\\\,mornin\\"'
      }
    ],
    capitalize: [
      { v: 'awesome sAuce.', e: 'Awesome sauce.' },
      { v: 345, e: '345' },
      { v: ['foo', 'bar'], e: 'Foo,Bar' }
    ],
    date: [
      // Day
      { c: 'v|date("d")', v: d, e: '06' },
      { c: 'v|date("D")', v: d, e: 'Tue' },
      { c: 'v|date("j")', v: d, e: '6' },
      { c: 'v|date("l")', v: d, e: 'Tuesday' },
      { c: 'v|date("N")', v: d, e: '2' },
      { c: 'v|date("N")', v: makeDate(420, 2011, 8, 4), e: '7'},
      { c: 'v|date("S")', v: d, e: 'th' },
      { c: 'v|date("w")', v: d, e: '2' },
      { c: 'v|date("z")', v: d, e: '248' },
      { c: 'v|date("z", 480)', v: makeDate(480, 2011, 0, 1), e: '0' },
      { c: 'v|date("z", 480)', v: makeDate(480, 2011, 11, 31), e: '364' },

      // Week
      { c: 'v|date("W")', v: d, e: '36' },

      // Month
      { c: 'v|date("F")', v: d, e: 'September' },
      { c: 'v|date("m")', v: d, e: '09' },
      { c: 'v|date("M")', v: d, e: 'Sep' },
      { c: 'v|date("n")', v: d, e: '9' },
      { c: 'v|date("t")', v: d, e: '30' },

      // Year
      { c: 'v|date("L")', v: d, e: 'false' },
      { c: 'v|date("L", 480)', v: makeDate(480, 2008, 1, 29), e: 'true' },
      { c: 'v|date("o")', v: d, e: '2011' },
      { c: 'v|date("o", 480)', v: makeDate(480, 2011, 0, 1), e: '2010' },
      { c: 'v|date("Y")', v: d, e: '2011' },
      { c: 'v|date("y")', v: d, e: '11' },

      // Time
      { c: 'v|date("a")', v: d, e: 'am' },
      { c: 'v|date("A")', v: d, e: 'AM' },
      { c: 'v|date("B")', v: d, e: '712' },
      { c: 'v|date("g")', v: d, e: '9' },
      { c: 'v|date("G")', v: d, e: '9' },
      { c: 'v|date("h")', v: d, e: '09' },
      { c: 'v|date("h", 480)', v: makeDate(480, 2011, 0, 1, 10), e: '10' },
      { c: 'v|date("H")', v: d, e: '09' },
      { c: 'v|date("i")', v: d, e: '05' },
      { c: 'v|date("s")', v: d, e: '02' },
      { c: 'v|date("d-m-Y")', v: d, e: '06-09-2011' },

      // Timezone
      { c: 'v|date("O")', v: d, e: '+0700' },
      { c: 'v|date("O", -120)', v: makeDate(-120, 2011, 0, 2), e: '-0200' },
      { c: 'v|date("Z")', v: d, e: '25200' },
      { c: 'v|date("O", 360)', v: d, e: '+0600' },
      { c: 'v|date("G", 320)', v: d, e: '10' },

      // Full Date/Time
      { c: 'v|date("c")', v: d, e: '2011-09-06T16:05:02.000Z' },
      { c: 'v|date("r")', v: d, e: 'Tue, 06 Sep 2011 16:05:02 GMT' },
      { c: 'v|date("U")', v: d, e: '1315325102' },

      // More complete S ordinal testing
      { c: 'v|date("S")', v: makeDate(420, 2011, 8, 1), e: 'st' },
      { c: 'v|date("S")', v: makeDate(420, 2011, 8, 2), e: 'nd' },
      { c: 'v|date("S")', v: makeDate(420, 2011, 8, 3), e: 'rd' },
      { c: 'v|date("S")', v: makeDate(420, 2011, 8, 4), e: 'th' },
      { c: 'v|date("S")', v: makeDate(420, 2011, 8, 10), e: 'th' },
      { c: 'v|date("S")', v: makeDate(420, 2011, 8, 11), e: 'th' },
      { c: 'v|date("S")', v: makeDate(420, 2011, 8, 12), e: 'th' },
      { c: 'v|date("S")', v: makeDate(420, 2011, 8, 13), e: 'th' },
      { c: 'v|date("S")', v: makeDate(420, 2011, 8, 21), e: 'st' },
      { c: 'v|date("S")', v: makeDate(420, 2011, 8, 22), e: 'nd' },
      { c: 'v|date("S")', v: makeDate(420, 2011, 8, 23), e: 'rd' },

      // Escape character
      { c: 'v|date("\\D")', v: d, e: 'D' },
      { c: 'v|date("\\t\\e\\s\\t")', v: d, e: 'test' },
      { c: 'v|date("\\\\D")', v: d, e: '\\Tue' },
      { c: 'v|date("jS \\o\\f F")', v: makeDate(420, 2012, 6, 4), e: '4th of July' }
    ],
    'default': [
      { c: 'v|default("tacos")', v: 'foo', e: 'foo' },
      { c: 'v|default("tacos")', v: 0, e: '0' },
      { c: 'v|default("tacos")', v: '', e: 'tacos' },
      { c: 'v|default("tacos")', v: undefined, e: 'tacos' },
      { c: 'v|default("tacos")', v: null, e: 'tacos' },
      { c: 'v|default("tacos")', v: false, e: 'tacos' }
    ],
    'escape': [
      { c: 'v|escape', v: '<foo>', e: '&lt;foo&gt;' },
      { c: 'v|e("js")', v: '"double quotes" and \'single quotes\'', e: '\\u0022double quotes\\u0022 and \\u0027single quotes\\u0027' },
      { c: 'v|escape("js")', v: '<script>and this</script>', e: '\\u003Cscript\\u003Eand this\\u003C/script\\u003E' },
      { c: 'v|e("js")', v: '\\ : backslashes, too', e: '\\u005C : backslashes, too' },
      { c: 'v|e("js")', v: 'and lots of whitespace: \r\n\t\v\f\b', e: 'and lots of whitespace: \\u000D\\u000A\\u0009\\u000B\\u000C\\u0008' },
      { c: 'v|e("js")', v: 'and "special" chars = -1;', e: 'and \\u0022special\\u0022 chars \\u003D \\u002D1\\u003B' },
      { c: 'v|e', v: ['<p>', '</p>'], e: '&lt;p&gt;,&lt;/p&gt;' }
    ],
    first: [
      { v: [1, 2, 3, 4], e: '1' },
      { v: '213', e: '2' },
      { v: { foo: 'blah' }, e: 'blah' }
    ],
    groupBy: [
      { c: 'v|groupBy("name")|json', v: [{ name: 'a', a: 1 }, { name: 'a', a: 2 }, { name: 'b', a: 3 }], e: JSON.stringify({a: [{a: 1}, {a: 2}], b: [{a: 3}]}).replace(/"/g, '&quot;') },
      { c: 'v|groupBy("name")', v: 'foo', e: 'foo' }
    ],
    join: [
      { c: 'v|join("+")', v: [1, 2, 3], e: '1+2+3' },
      { c: 'v|join(" * ")', v: [1, 2, 3], e: '1 * 2 * 3' },
      { c: 'v|join(",")', v: [1, 2, 3], e: '1,2,3' },
      { c: 'v|join(", ")', v: { f: 1, b: 2, z: 3 }, e: '1, 2, 3' },
      { c: 'v|join("-")', v: 'asdf', e: 'asdf' }
    ],
    json: [
      { v: { foo: 'bar', baz: [1, 2, 3] }, e: '{&quot;foo&quot;:&quot;bar&quot;,&quot;baz&quot;:[1,2,3]}' },
      { c: 'v|json(2)', v: { foo: 'bar', baz: [1, 2, 3] }, e: '{\n  &quot;foo&quot;: &quot;bar&quot;,\n  &quot;baz&quot;: [\n    1,\n    2,\n    3\n  ]\n}'}
    ],
    last: [
      { v: [1, 2, 3, 4], e: '4' },
      { v: '123', e: '3' },
      { v: { foo: 'blah', bar: 'nope' }, e: 'nope'}
    ],
    length: [
      { v: [1, 2, 3, 4], e: '4' },
      { v: '123', e: '3' },
      { v: { foo: 'blah', bar: 'nope' }, e: '2'},
      { v: 5, e: ''}
    ],
    lower: [
      { v: 'BaR', e: 'bar' },
      { v: '345', e: '345' },
      { v: ['FOO', 'bAr'], e: 'foo,bar' },
      { c: 'v|lower|join("")', v: { foo: 'BAR' }, e: 'bar' }
    ],
    safe: [
      { c: 'v|safe', v: '<&>', e: '<&>' },
      { c: 'v|raw', v: '<&>', e: '<&>' },
      { c: 'v|first|safe', v: ['<&>'], e: '<&>' },
      { c: 'v|safe|lower', v: '<&>fOo', e: '<&>foo' }
    ],
    replace: [
      { c: 'v|replace("o", "a")', v: 'foo', e: 'fao' },
      { c: 'v|replace("o", "", "g")', v: 'fooboo', e: 'fb' },
      { c: 'v|replace("\\W+", "-")', v: '$*&1aZ', e: '-1aZ' }
    ],
    reverse: [
      { v: [1, 2, 3], e: '3,2,1' },
      { v: 'asdf', e: 'fdsa' },
      { v: { baz: 'bop', foo: 'bar' }, e: 'foo,baz' }
    ],
    sort: [
      { v: [3, 1, 4], e: '1,3,4' },
      { v: 'zaq', e: 'aqz' },
      { v: { foo: '1', bar: '2' }, e: 'bar,foo' }
    ],
    striptags: [
      { v: '<h1>foo</h1> <div class="blah">hi</div>', e: 'foo hi' },
      { v: ['<foo>bar</foo>', '<bar>foo'], e: 'bar,foo' }
    ],
    title: [
      { v: 'this iS titLe case', e: 'This Is Title Case' },
      { v: ['foo', 'bAr'], e: 'Foo,Bar' }
    ],
    uniq: [
      { v: [2, 1, 2, 3, 4, 4], e: '2,1,3,4' },
      { v: 'foo', e: '' }
    ],
    upper: [
      { v: 'bar', e: 'BAR' },
      { v: 345, e: '345' },
      { v: ['foo', 'bAr'], e: 'FOO,BAR' },
      { c: 'v|upper|join("")', v: { foo: 'bar' }, e: 'BAR' }
    ],
    url_encode: [
      { v: 'param=1&anotherParam=2', e: 'param%3D1%26anotherParam%3D2' },
      { v: ['param=1', 'anotherParam=2'], e: 'param%3D1,anotherParam%3D2' }
    ],
    url_decode: [
      { v: 'param%3D1%26anotherParam%3D2', e: 'param=1&amp;anotherParam=2' },
      { v: ['param%3D1', 'anotherParam%3D2'], e: 'param=1,anotherParam=2' }
    ]
  };

function resetOptions() {
  swig.setDefaults(oDefaults);
  swig.invalidateCache();
}

describe('Filters:', function () {
  beforeEach(resetOptions);
  afterEach(resetOptions);

  describe('can be set', function () {
    it('and used in templates', function () {
      swig.setFilter('foo', function () { return 3; });
      expect(swig.render('{{ b|foo() }}')).to.equal('3');
    });

    it('and throw when you don\'t pass a function', function () {
      expect(function () {
        swig.setFilter('blah', 'not a function');
      }).to.throwError(/Filter "blah" is not a valid function\./);
    });
  });

  it('defaultTZOffset affects date filter', function () {
    swig.setDefaultTZOffset(240);
    var d = 1316761200000;
    expect(swig.render('{{ v|date("Y-m-d H:i a") }}', { locals: { v: d }}))
      .to.equal('2011-09-23 03:00 am');
    swig.setDefaultTZOffset(0);
  });

  it('can accept params', function () {
    swig.setFilter('foo', function (inp, arg) { return arg; });
    expect(swig.render('{{ b|foo(3) }}')).to.equal('3');
  });

  it('can be very complexly nested', function () {
    expect(swig.render('{{ b|default(c|default("3")) }}')).to.equal('3');
  });

  it('throws on unknown filter', function () {
    expect(function () {
      swig.render('{{ foo|thisisnotreal }}', { filename: 'foobar.html' });
    }).to.throwError(/Invalid filter "thisisnotreal" on line 1 in file foobar\.html\./);
  });

  _.each(cases, function (cases, filter) {
    describe(filter, function () {
      _.each(cases, function (c) {
        var code = '{{ ' + (c.c || 'v|' + filter) + ' }}',
          clone = _.cloneDeep(c.v);
        it(code + ', v=' + JSON.stringify(c.v) + ' should render ' + c.e.replace(/\n/g, '\\n'), function () {
          if ((/\|date\(/).test(code)) {
            code = '{{ ' + c.c.replace(/\"\)$/, '", 420)') + ' }}';
          }
          expect(swig.render(code, { locals: { v: c.v }}))
            .to.equal(c.e);
        });
        it(code + ', v=' + JSON.stringify(clone) + ' should should not mutate value', function () {
          expect(c.v).to.eql(clone);
        });
      });
    });
  });

  it('gh-337: does not overwrite original data', function () {
    var obj = { a: '<hi>' };
    swig.render('{{ a }}', { locals: { a: obj } });
    expect(obj.a).to.equal('<hi>');
  });

  it('gh-365: filters applied to functions after dotkey', function () {
    var locals = {
      w: {
        g: function () { return 'foo'; },
        r: function () { return [1, 2, 3]; }
      },
      b: function () { return 'bar'; }
    };
    expect(swig.render('{{ w.g("a")|replace("f", w.r().length) }}', { locals: locals })).to.equal('3oo');
    expect(swig.render('{{ "foo"|replace(w.g("a"), "bar") }}', { locals: locals })).to.equal('bar');
    expect(swig.render('{{ "3"|replace(w.g("a").length, "bar") }}', { locals: locals })).to.equal('bar');
    expect(swig.render('{{ "bar"|replace(b("a"), "foo") }}', { locals: locals })).to.equal('foo');
  });

  it('gh-397: Filter index applied to functions with arguments is one-off', function () {
    var locals = {
      r: function () { return [1, 2, 3]; },
      u: 'Tacos',
      t: 'L N'
    };

    expect(swig.render("{{ t|replace('L', r('items').length)|replace('N', u) }}", { locals: locals })).to.equal('3 Tacos');
  });

  it("gh-441: Chaining filters on top of functions within tags", function () {
    var locals = {
      getFoo: function () {
        return [1, 3, 0];
      }
    };

    expect(swig.render('{{ foo|default("bar")|reverse }}')).to.equal('rab');
    expect(swig.render("{{ getFoo('foo')|join('*')|reverse }}", { locals: locals })).to.equal('0*3*1');
    expect(swig.render("{% set foo = getFoo('foo')|join('+')|reverse %}{{ foo }}", { locals: locals })).to.equal('0+3+1');
    expect(swig.render("{% for a in getFoo('foo')|sort(true)|reverse %}{{ a }}%{% endfor %}", { locals: locals })).to.equal('3%1%0%');
    expect(swig.render('{% if "0+3+1" === getFoo("f")|join("+")|reverse %}yep{% endif %}', { locals: locals })).to.equal('yep');
    expect(swig.render('{% if "0+3+1" === getFoo("f")|join("+")|reverse && null|default(true) %}yep{% endif %}', { locals: locals })).to.equal('yep');
  });

});
