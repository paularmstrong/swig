var swig = require('../../lib/swig'),
  expect = require('expect.js');

describe('Tag: include', function () {
  it('Works with non-relative loader setups', function () {
    var s = new swig.Swig({ loader: swig.loaders.memory({ '/foo/foobar': 'tacos!' }, '/foo')});
    expect(s.render('{% include "foobar" %}')).to.equal('tacos!');
  });

  describe('{% include "foo" ignore missing %}', function () {
    it('does not throw if missing', function () {
      expect(swig.render('{% include "foo" ignore missing %}', { filename: '/foo' }))
        .to.equal('');
    });

    it('throws on bad syntax', function () {
      expect(function () {
        swig.render('{% include "foo" missing %}', { filename: '/bar' });
      }).to.throwError(/Unexpected token "missing" on line 1\./);

      expect(function () {
        swig.render('{% include "foo" ignore foobar %}', { filename: '/baz' });
      }).to.throwError(/Expected "missing" on line 1 but found "foobar"\./);
    });
  });

  describe('{% include [ "file", "file2" ] ignore missing %}', function () {
    it('does load "file" because it exists', function () {
      var s = new swig.Swig({loader: swig.loaders.memory({ '/foo/file': 'file' }, '/foo')});
      
      expect( s.render( '{% include [ "file", "file2" ] %}' ) )
      .to
      .equal('file');
    });

    it('does load "file2" because "file" do not exist', function () {
      var s = new swig.Swig({loader: swig.loaders.memory({ '/foo/file2': 'file2' }, '/foo')});

      expect( s.render( '{% include [ "file", "file2" ] %}' ) )
      .to
      .equal('file2');
    });

    it('does load nothing because both do not exist', function () {
      expect( swig.render('{% include [ "file", "file2" ] %}', { filename: '/foo' }) )
      .to
      .equal('');
    });
  });

  describe('{% include [ "file" + "name" ] %}', function () {
    it('supports string concatenation through + operator using " delimitator', function () {
      var s = new swig.Swig({loader: swig.loaders.memory({ '/foo/filename': 'bazinga!' }, '/foo')});
      expect( s.render( '{% include [ "file" + "name" ] %}' ) )
      .to
      .equal('bazinga!');
    });
  });

  describe('{% include [ "file" + myVar + "" ] %}', function () {
    it('supports string concatenation through + operators and variable names', function () {
      var s = new swig.Swig({
        loader: swig.loaders.memory({ '/foo/filename': 'bazinga!' }, '/foo')
      });
      expect( s.render( '{% include [ "file" + myVar + "" ] %}', { locals: { myVar : 'amen' } } ) )
      .to
      .equal('bazinga!');
    });
  });
});
