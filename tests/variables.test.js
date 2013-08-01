var swig = require('../index.js'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

var opts = { locals: {
    ap: 'apples',
    bu: 'burritos',
    a: 1,
    foo: '<blah>',
    c: function (b) { return (b) ? 'barfoo' : 'foobar'; },
    d: function (c) { return; },
    e: { f: function () { return 'eeeee'; } },
    food: { a: 'tacos' },
    g: { '0': { q: { c: { b: { foo: 'hi!' }}}}},
    h: { g: {  i: 'q' } },
    i: 'foo'
  }},
  cases = {
    'can be output': [
      { c: '{{ ap }}, {{ bu }}', e: 'apples, burritos' }
    ],
    'can be string and number literals': [
      { c: '{{ "a" }}', e: 'a' },
      { c: '{{ 1 }}', e: '1' },
      { c: '{{ 1.5 }}', e: '1.5' }
    ],
    'return empty string if undefined': [
      { c: '"{{ u }}"', e: '""' }
    ],
    'can use operators': [
      { c: '{{ a + 3 }}', e: '4' },
      { c: '{{ a * 3 }}', e: '3' },
      { c: '{{ a / 3 }}', e: String(1 / 3) },
      { c: '{{ 3 - a }}', e: '2' },
      { c: '{{ a % 3 }}', e: '1' },
    ],
    'can include objects': [
      { c: '{{ {0: 1, a: "b"} }}', e: '[object Object]' },
      { c: '{{ Object.keys({ 0: 1, a: "b" }) }}', e: '0,a' }
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
      { c: '{{ d(1)|default("tacos") }}', e: 'tacos' },
      { c: '{{ e.f(4, "blah") }}', e: 'eeeee' },
      { c: '{{ q.r(4, "blah") }}', e: '' },
      { c: '{{ e["f"](4, "blah") }}', e: 'eeeee' }
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
      { c: '{{ g[0][h.g.i]["c"].b[i] }}', e: 'hi!' },
    ]
  };

describe('Variables', function () {

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
    it('with left open state', function () {
      expect(function () {
        swig.render('{{ a(asdf }}');
      }).to.throwError(/Unable to parse "a\(asdf" on line 1\./);
      expect(function () {
        swig.render('{{ a[foo }}');
      }).to.throwError(/Mismatched nesting state on line 1\./);
    });

    it('with unknown filters', function () {
      expect(function () {
        swig.render('\n\n{{ a|bar() }}');
      }).to.throwError(/Invalid filter "bar" found on line 3\./);
    });

    it('with weird closing characters', function () {
      expect(function () {
        swig.render('\n{{ a) }}\n');
      }).to.throwError(/Mismatched nesting state on line 2\./);
      expect(function () {
        swig.render('\n\n{{ a] }}');
      }).to.throwError(/Unexpected closing square bracket on line 3\./);
    });

  });
});
