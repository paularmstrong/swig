var swig = require('../../index');

describe('Tag: if', function () {
  beforeEach(function () {
    swig.init({});
  });

  it('tests truthy and falsy values', function () {
    var tpl = swig.compile('{% if foo %}hi!{% endif %}{% if bar %}nope{% endif %}');
    tpl({ foo: 1, bar: false }).should.equal('hi!');

    tpl = swig.compile('{% if !foo %}hi!{% endif %}{% if !bar %}nope{% endif %}');
    tpl({ foo: 1, bar: false }).should.equal('nope');
  });

  it('can use not in place of !', function () {
    var tpl = swig.compile('{% if not foo %}hi!{% endif %}{% if not bar %}nope{% endif %}');
    tpl({ foo: true, bar: false }).should.equal('nope', 'not operator');
  });

  it('can use && and ||', function () {
    var tpl = swig.compile('{% if foo && (bar || baz) %}hi!{% endif %}');
    tpl({ foo: true, bar: true }).should.equal('hi!');
    tpl({ foo: true, baz: true }).should.equal('hi!');
    tpl({ foo: false }).should.equal('');
    tpl({ foo: true, bar: false, baz: false }).should.equal('');
  });

  it('can use "and" and "or" instead', function () {
    var tpl = swig.compile('{% if foo and bar %}hi!{% endif %}');
    tpl({ foo: true, bar: true }).should.equal('hi!');
    tpl = swig.compile('{% if foo or bar %}hi!{% endif %}');
    tpl({ foo: false, bar: true }).should.equal('hi!');
  });

  it('can use the "in" operator', function () {
    var tpl = swig.compile('{% if foo in bar %}hi!{% endif %}');
    tpl({ foo: 'b', bar: ['a', 'b', 'c'] }).should.equal('hi!');
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
    fn1.should.throw();
    fn2.should.throw();
    fn3.should.throw();
    fn4.should.throw();
  });

  it('allows filters on variables', function () {
    var tpl = swig.compile('{% if foo|length > 1 %}hi!{% endif %}');
    tpl({ foo: [1, 2, 3] }).should.equal('hi!');

    tpl = swig.compile('{% if foo|length === bar|length %}hi!{% endif %}{% if foo|length !== bar|length %}fail{% endif %}');
    tpl({ foo: [1, 2], bar: [3, 4] }).should.equal('hi!');
  });

});
