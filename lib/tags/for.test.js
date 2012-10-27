var swig = require('../../index');

describe('Tag: for', function () {
  beforeEach(function () {
    swig.init({
      allowErrors: true
    });
  });

  var tpl = swig.compile('{% for foo in bar %}{{ foo }}, {% endfor %}');
  it('loops arrays', function () {
    tpl({ bar: ['foo', 'bar', 'baz'] }).should.equal('foo, bar, baz, ');
  });

  it('loops objects', function () {
    tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }}).should.equal('foo, bar, baz, ');
  });

  it('allows filters', function () {
    var tpl = swig.compile('{% for foo in bar|reverse %}{{ foo }}{% endfor %}');
    tpl({ bar: ['baz', 'bar', 'foo'] }).should.equal('foobarbaz');
  });

  describe('loop object', function () {
    it('index0, key', function () {
      var tpl = swig.compile('{% for foo in bar %}[{{ loop.index0 }}, {{ loop.key }}]{% endfor %}');
      tpl({ bar: ['foo', 'bar', 'baz'] }).should.equal('[0, 0][1, 1][2, 2]');
      tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }}).should.equal('[0, baz][1, pow][2, foo]');
    });

    it('context', function () {
      var inner = swig.compile('{{ f }}', { filename: "inner" }),
        tpl = swig.compile('{{ f }}{% for f in bar %}{{ f }}{% include "inner" %}{{ f }}{% endfor %}{{ f }}');
      tpl({ f: 'z', bar: ['a'] }).should.equal('zaaaz');
      tpl({ bar: ['a'] }).should.equal('aaa');
    });

    it('index', function () {
      var tpl = swig.compile('{% for foo in bar %}{{ loop.index }}{% endfor %}');
      tpl({ bar: ['foo', 'bar', 'baz'] }).should.equal('123');
      tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }}).should.equal('123');
    });

    it('index0', function () {
      var tpl = swig.compile('{% for foo in bar %}{{ loop.index0 }}{% endfor %}');
      tpl({ bar: ['foo', 'bar', 'baz'] }).should.equal('012');
      tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }}).should.equal('012');
    });

    it('revindex', function () {
      var tpl = swig.compile('{% for foo in bar %}{{ loop.revindex }}{% endfor %}');
      tpl({ bar: ['foo', 'bar', 'baz'] }).should.equal('321');
      tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }}).should.equal('321');
    });

    it('revindex0', function () {
      var tpl = swig.compile('{% for foo in bar %}{{ loop.revindex0 }}{% endfor %}');
      tpl({ bar: ['foo', 'bar', 'baz'] }).should.equal('210');
      tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }}).should.equal('210');
    });

    it('first', function () {
      var tpl = swig.compile('{% for foo in bar %}{% if loop.first %}{{ foo }}{% endif %}{% endfor %}');
      tpl({ bar: ['foo', 'bar', 'baz'] }).should.equal('foo');
      tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }}).should.equal('foo');
    });

    it('last', function () {
      var tpl = swig.compile('{% for foo in bar %}{% if loop.last %}{{ foo }}{% endif %}{% endfor %}');
      tpl({ bar: ['foo', 'bar', 'baz'] }).should.equal('baz');
      tpl({ bar: { baz: 'foo', pow: 'bar', foo: 'baz' }}).should.equal('baz');
    });

    it('cycle', function () {
      var tpl = swig.compile('{% for foo in bar %}{{ loop.cycle("odd", "even") }} {% endfor %}');
      tpl({ bar: ['a', 'b', 'c', 'd'] }).should.equal('odd even odd even ');

      tpl = swig.compile('{% for foo in bar %}{{ loop.cycle("a", "b", "c", "d") }} {% endfor %}');
      tpl({ bar: [1, 2, 3, 4, 5, 6, 7] }).should.equal('a b c d a b c ');

      tpl = swig.compile('{% for foo in bar %}{{ loop.cycle("oh") }}, {% endfor %}{{ loop.cycle }}');
      tpl({ bar: [0], loop: { cycle: 'hi' }}).should.equal('oh, hi');
    });

    it('can be used as keys in vars', function () {
      var tpl = swig.compile('{% for key in bar %}{{ foo[loop.index0] }} {% endfor %}');
      tpl({ bar: ['a', 'b', 'c'], foo: ['hi', 'and', 'bye' ]}).should.equal('hi and bye ');
    });
  });


});
