var expect = require('expect.js'),
  swig = require('../../index');

describe('Tag: set', function () {
  beforeEach(function () {
    swig.init({ allowErrors: true });
  });

  it('sets any value as a variable in the current context', function () {
    expect(swig.compile('{% set foo = "bar" %} {{ foo }}')({})).to.equal(' bar');
    expect(swig.compile('{% set foo = bar|lower %} {{ foo }}')({ bar: 'BAR' })).to.equal(' bar');
    expect(swig.compile('{% set foo = ["hi", "bye"] %} {{ foo[0] }}')({})).to.equal(' hi');
    expect(swig.compile('{% set foo = { bar: "bar" } %} {{ foo.bar }}')({})).to.equal(' bar');
    expect(swig.compile('{% set foo = 99 %} {{ foo }}')({})).to.equal(' 99');
    expect(swig.compile('{% set foo = true %}{% if foo == true %}hi{% endif %}')({})).to.equal('hi');
  });

  it('sets for current context', function () {
    expect(swig.compile('{% set foo = true %}{% if foo %}{% set foo = false %}{% endif %}{{ foo }}')()
      )
      .to.equal('false');
  });

  it('sets across blocks', function () {
    expect(swig.compile('{% set foo = "foo" %}{% block a %}{{ foo }}{% set foo = "bar" %}{% endblock %}{{ foo }}{% block b %}{{ foo }}{% endblock %}')())
      .to.equal('foobarbar');
  });

  it('sets across extends', function () {
    swig.compile('{% block a %}{{ foo }}{% endblock %}', { filename: 'a' });
    expect(swig.compile('{% extends "a" %}{% set foo = "bar" %}')()
      ).to.equal('bar');
  });

  it('set number is really a number [gh-53]', function () {
    expect(swig.compile('{% set foo = 1 %}{{ foo|add(1) }}')())
      .to.equal('2');
    expect(swig.compile('{% set foo = "1" %}{{ foo|add(1) }}')())
      .to.equal('11');
    expect(swig.compile('{% set bar = 1 %} {% set foo = bar %}{{ foo|add(1) }}')())
      .to.equal(' 2');
    expect(swig.compile('{% set foo = 1 %} {% set foo = foo|add(1) %}{% set foo = foo|add(1) %}{{ foo|add(1) }}')())
      .to.equal(' 4');
  });
});
