var swig = require('../../lib/swig'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

describe('Tag: import', function () {
  it('throws on bad arguments', function () {
    expect(function () {
      swig.render('{% import bar %}');
    }).to.throwError(/Unexpected variable "bar" on line 1\./);
  });
});
