var require = require('../testutils').require,
  expect = require('expect.js'),
  swig = require('../../lib/swig');

describe('Tag: for', function () {
  beforeEach(function () {
    swig.init({
      allowErrors: true
    });
  });

  var tpl = swig.compile('{% for foo in bar %}{{ foo }}, {% endfor %}');
  it('loops arrays', function () {
    expect(tpl({ bar: ['foo', 'bar', 'baz'] })).to.equal('foo, bar, baz, ');
  });

  it('loops objects', function () {
    expect(tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }})).to.equal('foo, bar, baz, ');
  });

  it('allows filters', function () {
    var tpl = swig.compile('{% for foo in bar|reverse %}{{ foo }}{% endfor %}');
    expect(tpl({ bar: ['baz', 'bar', 'foo'] })).to.equal('foobarbaz');
  });

  describe('loop object', function () {
    it('index0, key', function () {
      var tpl = swig.compile('{% for foo in bar %}[{{ loop.index0 }}, {{ loop.key }}]{% endfor %}');
      expect(tpl({ bar: ['foo', 'bar', 'baz'] })).to.equal('[0, 0][1, 1][2, 2]');
      expect(tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }})).to.equal('[0, baz][1, pow][2, foo]');
    });

    it('context', function () {
      var inner = swig.compile('{{ f }}', { filename: "inner" }),
        tpl = swig.compile('{{ f }}{% for f in bar %}{{ f }}{% include "inner" %}{{ f }}{% endfor %}{{ f }}');
      expect(tpl({ f: 'z', bar: ['a'] })).to.equal('zaaaz');
      expect(tpl({ bar: ['a'] })).to.equal('aaa');
    });

    it('index', function () {
      var tpl = swig.compile('{% for foo in bar %}{{ loop.index }}{% endfor %}');
      expect(tpl({ bar: ['foo', 'bar', 'baz'] })).to.equal('123');
      expect(tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }})).to.equal('123');
    });

    it('index0', function () {
      var tpl = swig.compile('{% for foo in bar %}{{ loop.index0 }}{% endfor %}');
      expect(tpl({ bar: ['foo', 'bar', 'baz'] })).to.equal('012');
      expect(tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }})).to.equal('012');
    });

    it('revindex', function () {
      var tpl = swig.compile('{% for foo in bar %}{{ loop.revindex }}{% endfor %}');
      expect(tpl({ bar: ['foo', 'bar', 'baz'] })).to.equal('321');
      expect(tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }})).to.equal('321');
    });

    it('revindex0', function () {
      var tpl = swig.compile('{% for foo in bar %}{{ loop.revindex0 }}{% endfor %}');
      expect(tpl({ bar: ['foo', 'bar', 'baz'] })).to.equal('210');
      expect(tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }})).to.equal('210');
    });

    it('first', function () {
      var tpl = swig.compile('{% for foo in bar %}{% if loop.first %}{{ foo }}{% endif %}{% endfor %}');
      expect(tpl({ bar: ['foo', 'bar', 'baz'] })).to.equal('foo');
      expect(tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }})).to.equal('foo');
    });

    it('last', function () {
      var tpl = swig.compile('{% for foo in bar %}{% if loop.last %}{{ foo }}{% endif %}{% endfor %}');
      expect(tpl({ bar: ['foo', 'bar', 'baz'] })).to.equal('baz');
      expect(tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }})).to.equal('baz');
    });

    it('cycle', function () {
      var tpl = swig.compile('{% for foo in bar %}{{ loop.cycle("odd", "even") }} {% endfor %}');
      expect(tpl({ bar: ['a', 'b', 'c', 'd'] })).to.equal('odd even odd even ');

      tpl = swig.compile('{% for foo in bar %}{{ loop.cycle("a", "b", "c", "d") }} {% endfor %}');
      expect(tpl({ bar: [1, 2, 3, 4, 5, 6, 7] })).to.equal('a b c d a b c ');

      tpl = swig.compile('{% for foo in bar %}{{ loop.cycle("oh") }}, {% endfor %}{{ loop.cycle }}');
      expect(tpl({ bar: [0], loop: { cycle: 'hi' }})).to.equal('oh, hi');
    });

    it('can be used as keys in vars', function () {
      var tpl = swig.compile('{% for key in bar %}{{ foo[loop.index0] }} {% endfor %}');
      expect(tpl({ bar: ['a', 'b', 'c'], foo: ['hi', 'and', 'bye' ]})).to.equal('hi and bye ');
    });
  });


});
