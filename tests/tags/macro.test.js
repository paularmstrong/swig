var swig = require('../../index.js'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

describe('Tag: macro', function () {
  it('{% macro tacos() %}', function () {
    expect(swig.render('{% macro tacos() %}tacos{% endmacro %}{{ tacos() }}'))
      .to.equal('tacos');
  });

  it('{% macro tacos(a, b, c) %}', function () {
    expect(swig.render('{% macro tacos(a, b, c) %}{{ a }}, {{ c }}, {{ b }}{% endmacro %}{{ tacos(1, 3, 2) }}'))
      .to.equal('1, 2, 3');
  });
});
