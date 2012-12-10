var require = require('./testutils').require,
  expect = require('expect.js'),
  swig = require('../../lib/swig');

describe('swig.init', function () {

  it('accepts custom filters', function () {
    swig.init({ filters: {
      foo: function (input) {
        return 'bar';
      }
    }});
    expect(swig.compile('{{ asdf|foo }}')({ asdf: 'blah' })).to.equal('bar');
  });

  it('accepts custom extensions', function (done) {
    swig.init({
      allowErrors: true,
      extensions: { foobar: function () { done(); } },
      tags: {
        foo: function (indent) {
          return '_ext.foobar();';
        }
      }
    });
    expect(function () { swig.compile('{% foo %}')(); }).to.not.throwException();
  });

  it('accepts global context', function () {
    swig.init({
      globals: {bar: 'world'}
    });
    expect(swig.compile('{{ foo }} {{ bar }}')({ foo: 'hello' })).to.equal('hello world');
  });

  describe('allowErrors', function () {
    it('throws errors when true', function () {
      swig.init({ allowErrors: true });
      expect(function () { swig.compileFile('barfoo.html'); }).to.throwException();
    });

    if (typeof window === 'undefined') {
      it('does not throw when false, renders instead', function () {
        swig.init({
          root: __dirname + '/templates',
          allowErrors: false
        });
        expect(swig.compileFile('foobar.html').render())
          .to.match(/<pre>Error\: ENOENT, no such file or directory/i);
        expect(swig.compileFile('includes_notfound.html').render())
          .to.match(/<pre>Error\: ENOENT, no such file or directory/i);
      });
    }
  });
});

describe('swig.config', function () {
  it('can get config information', function () {
    // rest a value for test
    expect(swig.config()).to.have.key('tzOffset');
  });

  it('should update config', function () {
    swig.init({ allowErrors: true });
    swig.config({ allowErrors: false });
    expect(swig.config().allowErrors).not.to.be.ok();
  });

  it('should not change other config', function () {
    swig.init({ root: '/data/' });
    swig.config({ allowErrors: true });
    expect(swig.config().root).to.equal('/data/');
  });

  it('should merge filters', function () {
    swig.init({});
    swig.config({
      filters: {
        min: Math.min
      }
    });
    var filters = swig.config().filters;
    expect(filters).to.have.key('min');
    expect(filters).to.have.key('add');
  });
});


describe('swig.compileFile', function () {

  if (typeof window === 'undefined') {
    it('compiles a template from a file', function () {
      swig.init({
        root: __dirname + '/templates',
        allowErrors: true
      });
      expect(swig.compileFile('included_2.html').render({ array: [1, 1] }))
        .to.equal('2');
    });
    it('accepts an array in root config', function () {
      swig.init({
        root: ["/", __dirname + '/templates'],
        allowErrors: true
      });
      expect(swig.compileFile('included_2.html').render({ array: [1, 1] }))
        .to.equal('2');
    });
    it('can use an absolute path', function () {
      swig.init({
        root: __dirname + '/templates',
        allowErrors: true
      });
      expect(swig.compileFile(__dirname + '/templates/included_2.html').render({ array: [1, 1] }))
        .to.equal('2');
    });
  }

  it('throws in a browser context', function () {
    swig.init({});
    global.window = true;
    expect(function () { swig.compileFile('foobar'); }).to.throwException();
    delete global.window;
  });

  it('can render without context', function () {
    expect(swig.compile('{% set foo = "foo" %}{{ foo }}')()).to.equal('foo');
  });
});
