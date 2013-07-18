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
});
