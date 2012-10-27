var swig = require('./index');

describe('swig.init', function () {

  it('accepts custom filters', function () {
    swig.init({ filters: {
      foo: function (input) {
        return 'bar';
      }
    }});
    swig.compile('{{ asdf|foo }}')({ asdf: 'blah' }).should.equal('bar');
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
    swig.compile('{% foo %}')();
  });

  describe('allowErrors', function () {
    it('throws errors when true', function () {
      swig.init({ allowErrors: true });
      var fn = function () {
        swig.compileFile('barfoo.html');
      };
      fn.should.throw();
    });

    it('does not throw when false, renders instead', function () {
      swig.init({
        root: __dirname + '/tests/templates',
        allowErrors: false
      });
      swig.compileFile('foobar.html').render()
        .should.match(/<pre>Error\: ENOENT, no such file or directory/i);
      swig.compileFile('includes_notfound.html').render()
        .should.match(/<pre>Error\: ENOENT, no such file or directory/i);
    });
  });
});


describe('swig.compileFile', function () {

  it('compiles a template from a file', function () {
    swig.init({
      root: __dirname + '/tests/templates',
      allowErrors: true
    });
    swig.compileFile('included_2.html').render({ array: [1, 1] })
      .should.equal('2');
  });


  it('can use an absolute path', function () {
    swig.init({
      root: __dirname + '/tests/templates',
      allowErrors: true
    });
    swig.compileFile('/' + __dirname + '/tests/templates/included_2.html').render({ array: [1, 1] })
      .should.equal('2');
  });

  it('throws in a browser context', function () {
    swig.init({});
    global.window = true;
    var fn = function () {
      swig.compileFile('foobar');
    };
    fn.should.throw();
    delete global.window;
  });

  it('can render without context', function () {
    swig.compile('{% set foo = "foo" %}{{ foo }}')().should.equal('foo');
  });
});
