var require = require('../testutils').require,
  expect = require('expect.js'),
  swig = require('../../lib/swig');

describe('Tag: include', function () {
  beforeEach(function () {
    swig.init({
      root: __dirname + '/../templates',
      allowErrors: true
    });
  });

  it('includes the given template', function () {
    if (typeof window !== 'undefined') {
      swig.compile('{{array.length}}', { filename: 'included_2.html' });
    }
    expect(swig.compile('{% include "included_2.html" %}')({ array: ['foo'] }))
      .to.equal('1');
  });

  it('includes from parent templates', function () {
    swig.compile('foobar', { filename: 'foobar' });
    swig.compile('{% include "foobar" %}', { filename: 'parent' });
    expect(swig.compile('{% extends "parent" %}')())
      .to.equal('foobar');
  });

  it('accepts a variable as the file to include', function () {
    if (typeof window !== 'undefined') {
      swig.compile('{{array.length}}', { filename: 'included_2.html' });
    }
    expect(swig.compile('{% include inc %}')({ inc: 'included_2.html', array: ['foo'] }))
      .to.equal('1');
  });

  describe('with context', function () {
    beforeEach(function () {
      swig.compile('{{ foo }}{{ bar }}', { filename: 'withcontext' });
    });

    it('carries the given context to the template', function () {
      expect(swig.compile('{% set foo = { bar: "baz" } %}{% include "withcontext" with foo %}')())
        .to.equal('baz');
    });

    it('throws if "context" is not provided', function () {
      var fn = function () {
        swig.compile('{% include "withcontext" with %}');
      };
      expect(fn).to.throwException();
    });
  });

  describe('only', function () {
    it('restricts the context to not include global context', function () {
      swig.compile('{{ foo }}', { filename: 'only' });
      expect(swig.compile('{% include "only" only %}')({ foo: 'nope' }))
        .to.equal('');

      swig.compile('{{ foo }}{{ bar }}', { filename: 'withcontext' });
      expect(swig.compile('{% set foo = { bar: "baz" } %}{% set bar = "hi" %}{% include "withcontext" with foo only %}')())
        .to.equal('baz');
    });
  });

  describe('ignore missing', function () {
    it('does not throw if the template is not found', function () {
      expect(swig.compile('{% include "foobarbazbop" ignore missing %}'))
        .to.not.throwException();
    });
  });
});
