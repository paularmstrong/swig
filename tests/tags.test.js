var swig = require('../index.js'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

describe('Tags', function () {
  it('throws on unknown tags', function () {
    expect(function () {
      swig.render('\n \n{% foobar %}');
    }).to.throwError(/Unexpected tag "foobar" on line 3\./);
  });

  it('throws on unexpected endtag', function () {
    expect(function () {
      swig.render('\n{% if foo %}\n  asdf\n{% endfoo %}');
    }).to.throwError(/Unexpected end of tag "foo" on line 4\./);
  });
});
