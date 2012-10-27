var require = require('../testutils').require,
  expect = require('expect.js'),
  swig = require('../lib/swig');

describe('Tag: else', function () {
  beforeEach(function () {
    swig.init({
      allowErrors: true
    });
  });

  it('gets used', function () {
    var tpl = swig.compile('{% if foo|length > 1 %}hi!{% else %}nope{% endif %}');
    expect(tpl({ foo: [1, 2, 3] })).to.equal('hi!');
    expect(tpl({ foo: [1] })).to.equal('nope');
  });

  it('throws if used outside of "if" context', function () {
    var fn = function () {
      swig.compile('{% else %}');
    };
    expect(fn).to.throwException();
  });

  describe('else if', function () {
    it('works nicely', function () {
      var tpl = swig.compile('{% if foo|length > 2 %}foo{% else if foo|length < 2 %}bar{% endif %}');
      expect(tpl({ foo: [1, 2, 3] })).to.equal('foo');
      expect(tpl({ foo: [1, 2] })).to.equal('');
      expect(tpl({ foo: [1] })).to.equal('bar');
    });

    it('accepts conditionals', function () {
      var tpl = swig.compile('{% if foo %}foo{% else if bar && baz %}bar{% endif %}');
      expect(tpl({ bar: true, baz: true })).to.equal('bar');
    });
  });

  it('can have multiple else if and else conditions', function () {
    var tpl = swig.compile('{% if foo %}foo{% else if bar === "bar" %}bar{% else if 3 in baz %}baz{% else %}bop{% endif %}');
    expect(tpl({ foo: true })).to.equal('foo');
    expect(tpl({ bar: "bar" })).to.equal('bar');
    expect(tpl({ baz: [3] })).to.equal('baz');
    expect(tpl({ baz: [2] })).to.equal('bop');
    expect(tpl({ bar: false })).to.equal('bop');
  });

  describe('in "for" tags', function () {
    it('can be used as fallback', function () {
      var tpl = swig.compile('{% for foo in bar %}blah{% else %}hooray!{% endfor %}');
      expect(tpl({ bar: [] })).to.equal('hooray!');
      expect(tpl({ bar: {}})).to.equal('hooray!');

      expect(tpl({ bar: [1] })).to.equal('blah');
      expect(tpl({ bar: { foo: 'foo' }})).to.equal('blah');
    });

    it('throws if using "else if"', function () {
      var fn = function () {
        swig.compile('{% for foo in bar %}hi!{% else if blah %}nope{% endfor %}');
      };
      expect(fn).to.throwException();
    });
  });
});
