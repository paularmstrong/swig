var swig = require('../../index');

describe('Tag: include', function () {
  beforeEach(function () {
    swig.init({
      root: __dirname + '/../../tests/templates',
      allowErrors: true
    });
  });

  it('includes the given template', function () {
    if (typeof window !== 'undefined') {
      swig.compile('{{array.length}}', { filename: 'included_2.html' });
    }
    swig.compile('{% include "included_2.html" %}')({ array: ['foo'] })
      .should.equal('1');
  });

  it('includes from parent templates', function () {
    swig.compile('foobar', { filename: 'foobar' });
    swig.compile('{% include "foobar" %}', { filename: 'parent' });
    swig.compile('{% extends "parent" %}')()
      .should.equal('foobar');
  });

  it('accepts a variable as the file to include', function () {
    if (typeof window !== 'undefined') {
      swig.compile('{{array.length}}', { filename: 'included_2.html' });
    }
    swig.compile('{% include inc %}')({ inc: 'included_2.html', array: ['foo'] })
      .should.equal('1');
  });

  describe('with context', function () {
    beforeEach(function () {
      swig.compile('{{ foo }}{{ bar }}', { filename: 'withcontext' });
    });

    it('carries the given context to the template', function () {
      swig.compile('{% set foo = { bar: "baz" } %}{% include "withcontext" with foo %}')()
        .should.equal('baz');
    });

    it('throws if "context" is not provided', function () {
      var fn = function () {
        swig.compile('{% include "withcontext" with %}');
      };
      fn.should.throw();
    });
  });

  describe('only', function () {
    it('restricts the context to not include global context', function () {
      swig.compile('{{ foo }}', { filename: 'only' });
      swig.compile('{% include "only" only %}')({ foo: 'nope' })
        .should.equal('');

      swig.compile('{{ foo }}{{ bar }}', { filename: 'withcontext' });
      swig.compile('{% set foo = { bar: "baz" } %}{% set bar = "hi" %}{% include "withcontext" with foo only %}')()
        .should.equal('baz');
    });
  });

  describe('ignore missing', function () {
    it('does not throw if the template is not found', function () {
      swig.compile('{% include "foobarbazbop" ignore missing %}')();
    });
  });
});
