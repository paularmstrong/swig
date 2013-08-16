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

  it('can have any set of tokens in end tags', function () {
    expect(swig.render('{% if foo %}hi!{% endif the above will render if foo == true %}', { locals: { foo: true }}))
      .to.equal('hi!');
  });

  describe('can be set', function () {
    function parse(str, line, parser, types) {
      return true;
    }
    function compile(compiler, args, content) {
      return compiler(content) + '\n' +
        '_output += " tortilla!"';
    }
    it('and used in templates', function () {
      swig.setTag('tortilla', parse, compile, true);
      expect(swig.render('{% tortilla %}flour{% endtortilla %}'))
        .to.equal('flour tortilla!');
    });

    it('and use custom extensions', function () {
      swig.setExtension('tacos', function () { return 'Tacos!'; });
      swig.setTag('tacotag', parse, function (compiler, args, content) {
        return '_output += _ext.tacos();\n';
      });
      expect(swig.render('{% tacotag %}')).to.equal('Tacos!');
    });

    it('and throw if are not written correctly', function () {
      expect(function () {
        swig.setTag('tacos', null, compile);
      }).to.throwError(/Tag "tacos" parse method is not a valid function\./);

      expect(function () {
        swig.setTag('tacos', parse);
      }).to.throwError(/Tag "tacos" compile method is not a valid function\./);
    });
  });
});
