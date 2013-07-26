var swig = require('../../index.js'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

describe('Filter: raw', function () {
  it('{{ "<foo>"|raw }}', function () {
    expect(swig.render('{{ "<foo>"|raw }}')).to.equal('<foo>');
    expect(swig.render('{{ "<foo>"|raw() }}')).to.equal('<foo>');
  });

  it('{{ "<&>"|raw }}', function () {
    var opts = { locals: { foo: '<&>' }};
    expect(swig.render('{{ foo|raw }}', opts)).to.equal('<&>');
    expect(swig.render('{{ foo|raw() }}', opts)).to.equal('<&>');
  });
});
