var swig = require('../../index');

describe('Tag: else', function () {
  beforeEach(function () {
    swig.init({
      allowErrors: true
    });
  });

  it('gets used', function () {
    var tpl = swig.compile('{% if foo|length > 1 %}hi!{% else %}nope{% endif %}');
    tpl({ foo: [1, 2, 3] }).should.equal('hi!');
    tpl({ foo: [1] }).should.equal('nope');
  });

  it('throws if used outside of "if" context', function () {
    var fn = function () {
      swig.compile('{% else %}');
    };
    fn.should.throw();
  });

  describe('else if', function () {
    it('works nicely', function () {
      var tpl = swig.compile('{% if foo|length > 2 %}foo{% else if foo|length < 2 %}bar{% endif %}');
      tpl({ foo: [1, 2, 3] }).should.equal('foo');
      tpl({ foo: [1, 2] }).should.equal('');
      tpl({ foo: [1] }).should.equal('bar');
    });

    it('accepts conditionals', function () {
      var tpl = swig.compile('{% if foo %}foo{% else if bar && baz %}bar{% endif %}');
      tpl({ bar: true, baz: true }).should.equal('bar');
    });
  });

  it('can have multiple else if and else conditions', function () {
    var tpl = swig.compile('{% if foo %}foo{% else if bar === "bar" %}bar{% else if 3 in baz %}baz{% else %}bop{% endif %}');
    tpl({ foo: true }).should.equal('foo');
    tpl({ bar: "bar" }).should.equal('bar');
    tpl({ baz: [3] }).should.equal('baz');
    tpl({ baz: [2] }).should.equal('bop');
    tpl({ bar: false }).should.equal('bop');
  });

  describe('in "for" tags', function () {
    it('can be used as fallback', function () {
      var tpl = swig.compile('{% for foo in bar %}blah{% else %}hooray!{% endfor %}');
      tpl({ bar: [] }).should.equal('hooray!');
      tpl({ bar: {}}).should.equal('hooray!');

      tpl({ bar: [1] }).should.equal('blah');
      tpl({ bar: { foo: 'foo' }}).should.equal('blah');
    });

    it('throws if using "else if"', function () {
      var fn = function () {
        swig.compile('{% for foo in bar %}hi!{% else if blah %}nope{% endfor %}');
      };
      fn.should.throw();
    });
  });
});
