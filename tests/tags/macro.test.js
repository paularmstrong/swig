var swig = require('../../lib/swig'),
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

  it('does not auto-escape', function () {
    expect(swig.render('{% macro foo %}<h1>{{ "<p>" }}</h1>{% endmacro %}{{ foo() }}'))
      .to.equal('<h1>&lt;p&gt;</h1>');
  });

  it('throws on bad argument names', function () {
    expect(function () {
      swig.render('{% macro tacos(burrito.bean) %}{% endmacro %}');
    }).to.throwError(/Unexpected dot in macro argument "burrito\.bean" on line 1\./);
    expect(function () {
      swig.render('{% macro tacos(burrito), asdf) %}{% endmacro %}');
    }).to.throwError(/Unexpected parenthesis close on line 1\./);
  });
});
