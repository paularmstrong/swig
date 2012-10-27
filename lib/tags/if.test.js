var testCase = require('nodeunit').testCase,
  swig = require('../../index');

exports['if'] = testCase({
  setUp: function (callback) {
    swig.init({});
    callback();
  },

  basic: function (test) {
    var tpl = swig.compile('{% if foo %}hi!{% endif %}{% if bar %}nope{% endif %}');
    test.strictEqual(tpl({ foo: 1, bar: false }), 'hi!');

    tpl = swig.compile('{% if !foo %}hi!{% endif %}{% if !bar %}nope{% endif %}');
    test.strictEqual(tpl({ foo: 1, bar: false }), 'nope', '! operator');

    tpl = swig.compile('{% if not foo %}hi!{% endif %}{% if not bar %}nope{% endif %}');
    test.strictEqual(tpl({ foo: true, bar: false }), 'nope', 'not operator');

    tpl = swig.compile('{% if foo && (bar || baz) %}hi!{% endif %}');
    test.strictEqual(tpl({ foo: true, bar: true }), 'hi!');
    test.strictEqual(tpl({ foo: true, baz: true }), 'hi!');
    test.strictEqual(tpl({ foo: false }), '');

    tpl = swig.compile('{% if foo and bar %}hi!{% endif %}');
    test.strictEqual(tpl({ foo: true, bar: true }), 'hi!', 'and syntax');
    tpl = swig.compile('{% if foo or bar %}hi!{% endif %}');
    test.strictEqual(tpl({ foo: false, bar: true }), 'hi!', 'or syntax');

    tpl = swig.compile('{% if foo in bar %}hi!{% endif %}');
    test.strictEqual(tpl({ foo: 'b', bar: ['a', 'b', 'c'] }), 'hi!', 'in syntax');

    test.done();
  },

  errors: function (test) {
    test.throws(function () {
      swig.compile('{% if foo bar %}{% endif %}');
    });
    test.throws(function () {
      swig.compile('{% if foo !== > bar %}{% endif %}');
    });
    test.throws(function () {
      swig.compile('{% if (foo %}{% endif %}');
    });
    test.throws(function () {
      swig.compile('{% if foo > bar) %}{% endif %}');
    });
    test.done();
  },

  'var literals in tags allow filters': function (test) {
    var tpl = swig.compile('{% if foo|length > 1 %}hi!{% endif %}');
    test.strictEqual(tpl({ foo: [1, 2, 3] }), 'hi!');

    tpl = swig.compile('{% if foo|length === bar|length %}hi!{% endif %}{% if foo|length !== bar|length %}fail{% endif %}');
    test.strictEqual(tpl({ foo: [1, 2], bar: [3, 4] }), 'hi!');
    test.done();
  }
});
