var swig = require('../lib/swig'),
  expect = require('expect.js');

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

  describe('can be created with setSimpleTag()', function () {
    it('and used in templates', function () {
      swig.setSimpleTag('tortas', function () { return 'asada torta'; });
      expect(swig.render('{% tortas %}')).to.equal('asada torta');
    });

    it('when output has double quotes', function () {
      swig.setSimpleTag('dquotetest', function () { return 'I said "hola"'; });
      expect(swig.render('{% dquotetest %}')).to.equal('I said "hola"');
    });

    it('when tags have number arguments', function () {
      swig.setSimpleTag('simpleargs', function (n1, n2) { return n1 + n2; });
      expect(swig.render('{% simpleargs 1 3 %}')).to.equal('4');
    });

    it('when tags have string arguments', function () {
      swig.setSimpleTag('printAdd', function (s1, s2) { return s1 + ' + ' + s2; });
      expect(swig.render('{% printAdd "1" "3" %}')).to.equal('1 + 3');
      expect(swig.render("{% printAdd '1' '3' %}")).to.equal('1 + 3');
    });

    it('when tags have variable arguments', function () {
      swig.setSimpleTag('printVars', function (x, y) { return x + ' ' + y; });
      var output = swig.render('{% printVars x y %}', { locals: { x: 1, y: 'foo' }});
      expect(output).to.equal('1 foo');
    });

    it('when tag arguments reference missing variables', function () {
      swig.setSimpleTag('printVars', function (x, y) { return x + ' ' + y; });
      var output = swig.render('{% printVars x y %}', { locals: { y: 'foo' }});
      expect(output).to.equal('undefined foo');
    });

    it('does not escape html in the output', function () {
      swig.setSimpleTag('echo', function (x) { return x; });
      var markup = '<script>alert("hi")</script>',
        output = swig.render('{% echo x %}', { locals: { x: markup }});
      expect(output).to.equal(markup);
    });

    it('and plays nice with surrounding template content', function () {
      swig.setSimpleTag('echo', function (x) { return x; });
      var output = swig.render('abc{% echo "def" %}ghi');
      expect(output).to.equal('abcdefghi');
    });
  });
});
