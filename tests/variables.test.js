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
});
