var swig = require('../lib/swig'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

var n = new Swig(),
  oDefaults = n.options;

function resetOptions() {
  swig.setDefaults(oDefaults);
  swig.invalidateCache();
}

var cases = {
  'can be output': [
    { c: '{{ ap }}, {{ bu }}', e: 'apples, burritos' }
  ],
  'can be string and number literals': [
    { c: '{{ "a" }}', e: 'a' },
    { c: '{{ 1 }}', e: '1' },
    { c: '{{ 1.5 }}', e: '1.5' },
    { c: '{{ true }}', e: 'true' }
  ],
  'return empty string if undefined': [
    { c: '"{{ u }}"', e: '""' }
  ],
  'return empty string if null': [
    { c: '"{{ n }}"', e: '""' },
    { c: '"{{ o3.n }}"', e: '""' }
  ],
  'can use operators': [
    { c: '{{ a + 3 }}', e: '4' },
    { c: '{{ a * 3 }}', e: '3' },
    { c: '{{ a / 3 }}', e: String(1 / 3) },
    { c: '{{ 3 - a }}', e: '2' },
    { c: '{{ a % 3 }}', e: '1' }
  ],
  'can include objects': [
    { c: '{{ {0: 1, a: "b"} }}', e: '[object Object]' },
    { c: '{{ Object.keys({ 0: 1, a: "b" }) }}', e: '0,a' },
    { c: '{{ o.foo() }}', e: 'bar'},
    { c: '{{ o2.foo() }}', e: 'bar'},
    { c: '{{ o2.foo("foobar") }}', e: 'foobar'},
    { c: '{{ o2.bar }}', e: ''},
    { c: '{{ o2.$bar }}', e: 'bar'}
  ],
  'can include arrays': [
    { c: '{{ [0, 1, 3] }}', e: '0,1,3' }
  ],
  'are escaped by default': [
    { c: '{{ foo }}', e: '&lt;blah&gt;' }
  ],
  'can execute functions': [
    { c: '{{ c() }}', e: 'foobar' },
    { c: '{{ c(1) }}', e: 'barfoo' },
    { c: '{{ d(1)|default("tacos")|replace("tac", "churr") }}', e: 'churros' },
    { c: '{{ d()|default("tacos") }}', e: 'tacos' },
    { c: '{{ e.f(4, "blah") }}', e: 'eeeee' },
    { c: '{{ q.r(4, "blah") }}', e: '' },
    { c: '{{ e["f"](4, "blah") }}', e: 'eeeee' },
    { c: '{{ chalupa().bar() }}', e: 'chalupas' },
    { c: '{{ { foo: "bar" }.foo }}', e: 'bar' }
  ],
  'can run multiple filters': [
    { c: '{{ a|default("")|default(1) }}', e: '1' }
  ],
  'can have filters with operators': [
    { c: '{{ a|default("1") + b|default("2") }}', e: '12' }
  ],
  'can use both notation types': [
    { c: '{{ food.a }}', e: 'tacos' },
    { c: '{{ food["a"] }}', e: 'tacos' },
    { c: '{{ g[0][h.g.i]["c"].b[i] }}', e: 'hi!' }
  ],
  'can do some logical operations': [
    { c: '{{ ap === "apples" }}', e: 'true' },
    { c: '{{ not a }}', e: 'false' },
    { c: '{{ a <= 4 }}', e: 'true' }
  ],
  'null objects': [
    { c: '{{ n }}', e: '' }
  ]
};

describe('Variables', function () {
  var opts = { locals: {
    ap: 'apples',
    bu: 'burritos',
    a: 1,
    foo: '<blah>',
    chalupa: function () { return { bar: function () { return 'chalupas'; }}; },
    c: function (b) { return (b) ? 'barfoo' : 'foobar'; },
    d: function (c) { return; },
    e: { f: function () { return 'eeeee'; } },
    food: { a: 'tacos' },
    g: { '0': { q: { c: { b: { foo: 'hi!' }}}}},
    h: { g: {  i: 'q' } },
    i: 'foo',
    n: null,
    o: Object.create({ foo: function () { return 'bar'; } }),
    o2: { a: 'bar', foo: function (b) { return b || this.a; }, $bar: 'bar' },
    o3: { n: null }
  }};
  _.each(cases, function (cases, description) {
    describe(description, function () {
      _.each(cases, function (c) {
        it(c.c, function () {
          expect(swig.render(c.c, opts)).to.equal(c.e);
        });
      });
    });
  });

  describe('can throw errors when parsing', function () {
    var oDefaults;
    beforeEach(resetOptions);
    afterEach(resetOptions);

    it('with left open state', function () {
      expect(function () {
        swig.render('{{ a(asdf }}');
      }).to.throwError(/Unable to parse "a\(asdf" on line 1\./);
      expect(function () {
        swig.render('{{ a[foo }}');
      }).to.throwError(/Unable to parse "a\[foo" on line 1\./);
    });

    it('with unknown filters', function () {
      expect(function () {
        swig.render('\n\n{{ a|bar() }}');
      }).to.throwError(/Invalid filter "bar" on line 3\./);
    });

    it('with weird closing characters', function () {
      expect(function () {
        swig.render('\n{{ a) }}\n');
      }).to.throwError(/Mismatched nesting state on line 2\./);
      expect(function () {
        swig.render('\n\n{{ a] }}');
      }).to.throwError(/Unexpected closing square bracket on line 3\./);
      expect(function () {
        swig.render('\n\n{{ a} }}');
      }).to.throwError(/Unexpected closing curly brace on line 3\./);
    });

    it('with colons outside of objects', function () {
      expect(function () {
        swig.render('{{ foo:bar }}');
      }).to.throwError(/Unexpected colon on line 1\./);
    });

    it('with random dots', function () {
      expect(function () {
        swig.render('{{ .a }}');
      }).to.throwError(/Unexpected key "a" on line 1\./);

      expect(function () {
        swig.render('{{ {a.foo: "1"} }}');
      }).to.throwError(/Unexpected dot on line 1\./);
    });

    it('with bad commas', function () {
      expect(function () {
        swig.setDefaults({ autoescape: false });
        swig.render('{{ foo, bar }}');
      }).to.throwError(/Unexpected comma on line 1\./);
    });

    it('reserved JS words', function () {
      _.each(['break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'finally', 'for', 'function', 'if', 'in', 'instanceof', 'new', 'return', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with'], function (r) {
        expect(function () {
          swig.render('{{ ' + r + ' }}', { filename: r + '.html' });
        }).to.throwError(/Reserved keyword "\w+" attempted to be used as a variable on line 1 in file \w+\.html\./);
      });
    });

    it('invalid logic', function () {
      expect(function () {
        swig.render('{{ === foo }}');
      }).to.throwError(/Unexpected logic on line 1\./);
    });
  });
});
