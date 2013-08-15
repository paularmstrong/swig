var swig = require('../lib/swig'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

describe('Comments', function () {
  it('are ignored and removed from output', function () {
    expect(swig.render('{# some content #}')).to.equal('');
    expect(swig.render('{# \n can have newlines \r\n in whatever type #}')).to.equal('');
    expect(swig.render('{#\n{% extends "layout.twig" %}\n#}')).to.equal('');
  });
});
