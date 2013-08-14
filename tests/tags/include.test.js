var swig = require('../../lib/swig'),
  expect = require('expect.js');

describe('Tag: include', function () {
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
});
