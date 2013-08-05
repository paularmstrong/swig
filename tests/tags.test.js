var swig = require('../lib/swig'),
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

  it('can be added', function () {
    function parse(str, line, parser, types) {
      return true;
    }
    function compile(compiler, args, content) {
      return compiler(content) + '\n' +
        '_output += " tortilla!"';
    }
    swig.addTag('tortilla', parse, compile, true);
    expect(swig.render('{% tortilla %}flour{% endtortilla %}'))
      .to.equal('flour tortilla!');
  });
});
