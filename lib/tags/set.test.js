var swig = require('../../index');

describe('Tag: set', function () {
  beforeEach(function () {
    swig.init({ allowErrors: true });
  });

  it('sets any value as a variable in the current context', function () {
    swig.compile('{% set foo = "bar" %} {{ foo }}')({}).should.equal(' bar');
    swig.compile('{% set foo = bar|lower %} {{ foo }}')({ bar: 'BAR' }).should.equal(' bar');
    swig.compile('{% set foo = ["hi", "bye"] %} {{ foo[0] }}')({}).should.equal(' hi');
    swig.compile('{% set foo = { bar: "bar" } %} {{ foo.bar }}')({}).should.equal(' bar');
    swig.compile('{% set foo = 99 %} {{ foo }}')({}).should.equal(' 99');
    swig.compile('{% set foo = true %}{% if foo == true %}hi{% endif %}')({}).should.equal('hi');
  });

  it('sets for current context', function () {
    swig.compile('{% set foo = true %}{% if foo %}{% set foo = false %}{% endif %}{{ foo }}')()
      .should.equal('false');
  });

  it('sets across blocks', function () {
    swig.compile('{% set foo = "foo" %}{% block a %}{{ foo }}{% set foo = "bar" %}{% endblock %}{{ foo }}{% block b %}{{ foo }}{% endblock %}')()
      .should.equal('foobarbar');
  });

  it('sets across extends', function () {
    swig.compile('{% block a %}{{ foo }}{% endblock %}', { filename: 'a' });
    swig.compile('{% extends "a" %}{% set foo = "bar" %}')()
      .should.equal('bar');
  });

  it('set number is really a number [gh-53]', function () {
    swig.compile('{% set foo = 1 %}{{ foo|add(1) }}')()
      .should.equal('2');
    swig.compile('{% set foo = "1" %}{{ foo|add(1) }}')()
      .should.equal('11');
    swig.compile('{% set bar = 1 %} {% set foo = bar %}{{ foo|add(1) }}')()
      .should.equal(' 2');
    swig.compile('{% set foo = 1 %} {% set foo = foo|add(1) %}{% set foo = foo|add(1) %}{{ foo|add(1) }}')()
      .should.equal(' 4');
  });
});
