var swig = require('../index.js'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

describe('Variables', function () {
  it('can be string and number literals', function () {
    expect(swig.render('{{ "a" }}')).to.eql('a');
    expect(swig.render('{{ 1 }}')).to.eql('1');
    expect(swig.render('{{ 1.5 }}')).to.eql('1.5');
  });

  it('return empty string if undefined', function () {
    expect(swig.render('"{{ a }}"')).to.eql('""');
  });

  it('can use operators', function () {
    var opts = { locals: { a: 1 }};
    expect(swig.render('{{ a + 3 }}', opts)).to.equal('4');
    expect(swig.render('{{ a * 3 }}', opts)).to.equal('3');
    expect(swig.render('{{ a / 3 }}', opts)).to.equal(String(1 / 3));
    expect(swig.render('{{ 3 - a }}', opts)).to.equal('2');
    expect(swig.render('{{ a % 3 }}', opts)).to.equal('1');
  });

  it('can include objects', function () {
    expect(swig.render('{{ {0: 1, a: "b" } }}')).to.equal('[object Object]');
    expect(swig.render('{{ Object.keys({ 0: 1, a: "b" }) }}')).to.equal('0,a');
  });

  it('can include arrays', function () {
    expect(swig.render('{{ [0, 1, 3] }}')).to.equal('0,1,3');
  });

  it('can execute functions', function () {
    var opts = { locals: {
      a: function (b) { return (b) ? 'barfoo' : 'foobar'; },
      b: function (c) { return; }
    }};
    expect(swig.render('{{ a() }}', opts)).to.equal('foobar');
    expect(swig.render('{{ a(1) }}', opts)).to.equal('barfoo');
    expect(swig.render('{{ b(1)|default("tacos") }}', opts)).to.equal('tacos');
  });

  it('can run multiple filters', function () {
    expect(swig.render('{{ a|default("")|default(1) }}')).to.equal('1');
  });

  describe('notation', function () {
    var opts = { locals: { foo: { a: 'tacos' }}};
    it('can use dot-notation', function () {
      expect(swig.render('{{ foo.a }}', opts)).to.equal('tacos');
    });

    it('can use bracket-notation', function () {
      expect(swig.render('{{ foo["a"] }}', opts)).to.equal('tacos');
    });

    it('can be very complex', function () {
      opts.locals = { a: { '0': { q: { c: { b: { foo: 'hi!' }}}}}, h: { g: {  i: 'q' } }, d: 'foo' };

      expect(swig.render('{{ a[0][h.g.i]["c"].b[d] }}', opts)).to.equal('hi!');
    });
  });

  describe('can throw errors when parsing', function () {
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
      }).to.throwError(/Invalid filter "bar" found on line 3\./);
    });

    it('with weird closing characters', function () {
      expect(function () {
        swig.render('\n{{ a) }}\n');
      }).to.throwError(/Unexpected closing parenthesis on line 2\./);
      expect(function () {
        swig.render('\n\n{{ a] }}');
      }).to.throwError(/Unexpected closing square bracket on line 3\./);
    });

    it('with random commas', function () {
      expect(function () {
        swig.render('\n{{ a, b }}\n');
      }).to.throwError(/Unexpected comma on line 2\./);
    });
  });
});
