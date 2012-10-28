var require = require('../testutils').require,
  expect = require('expect.js'),
  swig = require('../../lib/swig');

describe('Tag: if', function () {
  beforeEach(function () {
    swig.init({});
  });

  it('tests truthy and falsy values', function () {
    var tpl = swig.compile('{% if foo %}hi!{% endif %}{% if bar %}nope{% endif %}');
    expect(tpl({ foo: 1, bar: false })).to.equal('hi!');

    tpl = swig.compile('{% if !foo %}hi!{% endif %}{% if !bar %}nope{% endif %}');
    expect(tpl({ foo: 1, bar: false }))
      .to.equal('nope');
  });

  it('can use not in place of !', function () {
    var tpl = swig.compile('{% if not foo %}hi!{% endif %}{% if not bar %}nope{% endif %}');
    expect(tpl({ foo: true, bar: false }))
      .to.equal('nope', 'not operator');
  });

  it('can use && and ||', function () {
    var tpl = swig.compile('{% if foo && (bar || baz) %}hi!{% endif %}');
    expect(tpl({ foo: true, bar: true })).to.equal('hi!');
    expect(tpl({ foo: true, baz: true })).to.equal('hi!');
    expect(tpl({ foo: false })).to.equal('');
    expect(tpl({ foo: true, bar: false, baz: false })).to.equal('');
  });

  it('can use "and" and "or" instead', function () {
    var tpl = swig.compile('{% if foo and bar %}hi!{% endif %}');
    expect(tpl({ foo: true, bar: true })).to.equal('hi!');

    tpl = swig.compile('{% if foo or bar %}hi!{% endif %}');
    expect(tpl({ foo: false, bar: true })).to.equal('hi!');
  });

  it('can use the "in" operator', function () {
    var tpl = swig.compile('{% if foo in bar %}hi!{% endif %}');
    expect(tpl({ foo: 'b', bar: ['a', 'b', 'c'] })).to.equal('hi!');
  });

  it('throws on bad conditional syntax', function () {
    var fn1 = function () {
        swig.compile('{% if foo bar %}{% endif %}');
      },
      fn2 = function () {
        swig.compile('{% if foo !== > bar %}{% endif %}');
      },
      fn3 = function () {
        swig.compile('{% if (foo %}{% endif %}');
      },
      fn4 = function () {
        swig.compile('{% if foo > bar) %}{% endif %}');
      };
    expect(fn1).to.throwException();
    expect(fn2).to.throwException();
    expect(fn3).to.throwException();
    expect(fn4).to.throwException();
  });

  it('allows filters on variables', function () {
    var tpl = swig.compile('{% if foo|length > 1 %}hi!{% endif %}');
    expect(tpl({ foo: [1, 2, 3] })).to.equal('hi!');

    tpl = swig.compile('{% if foo|length === bar|length %}hi!{% endif %}{% if foo|length !== bar|length %}fail{% endif %}');
    expect(tpl({ foo: [1, 2], bar: [3, 4] })).to.equal('hi!');
  });

});
