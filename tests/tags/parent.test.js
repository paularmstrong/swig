var swig = require('../../lib/swig'),
  expect = require('expect.js');

describe('Tag: parent', function () {
  it('does nothing if no parent', function () {
    expect(swig.render('{% parent %}')).to.equal('');
  });

  it('does not accept arguments', function () {
    expect(function () {
      swig.render('{% parent foobar %}');
    }).to.throwError(/Unexpected argument "foobar" on line 1\./);
  });
});
