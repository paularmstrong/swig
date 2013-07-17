var swig = require('../index.js'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

var n = new Swig(),
  oDefaults = n.options;

function resetOptions() {
  swig.setDefaults(oDefaults);
  swig.invalidateCache();
}

describe('Filters', function () {
  beforeEach(resetOptions);
  afterEach(resetOptions);

  it('can be added', function () {
    swig.addFilter('foo', function () { return 3; });
    expect(swig.render('{{ b|foo() }}')).to.equal('3');
  });

  it('can accept params', function () {
    swig.addFilter('foo', function (inp, arg) { return arg; });
    expect(swig.render('{{ b|foo(3) }}')).to.equal('3');
  });

});
