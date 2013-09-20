var swig = require('../../lib/swig'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

describe('Tag: import', function () {
  it('throws on bad arguments', function () {
    expect(function () {
      swig.render('{% import bar %}');
    }).to.throwError(/Unexpected variable "bar" on line 1\./);
  });

  it('can import a macro', function () {
    expect(
      swig.render("{% import '"+__dirname+"/importtest.html' as test %}{{ test.test('d','e','f') }}")
    ).to.match(/d e and f/);
  });

  it('obeys default search paths', function () {
    swig.setDefaults({ importPaths:[__dirname] });
    var initializedSwig=new swig.Swig();
    expect(
      initializedSwig.render("{% import 'importtest.html' as test %}{{ test.test('d','e','f') }}")
    ).to.match(/d e and f/);
  });

});
