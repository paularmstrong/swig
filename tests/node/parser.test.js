var require = require('./testutils').require,
  expect = require('expect.js'),
  swig = require('../../lib/swig'),
  tags = require('../../lib/tags'),
  parser = require('../../lib/parser');

describe('Tags', function () {
  it('undefined tag throws error', function () {
    expect(function () { parser.parse('{% foobar %}', {}); })
      .to.throwException();
  });

  it('creates a token', function () {
    expect(parser.parse('{% blah %}', { blah: {} }))
      .to.eql([{
        type: parser.TOKEN_TYPES.LOGIC,
        line: 1,
        name: 'blah',
        args: [],
        compile: {},
        strip: { before: false, after: false, start: false, end: false },
        parent: []
      }]);
  });

  it('appends arguments', function () {
    expect(parser.parse('{% blah "foobar" %}', { blah: {} }))
      .to.eql([{
        type: parser.TOKEN_TYPES.LOGIC,
        line: 1,
        name: 'blah',
        args: ['"foobar"'],
        compile: {},
        strip: { before: false, after: false, start: false, end: false },
        parent: []
      }]);
  });

  it('appends multiple arguments', function () {
    expect(parser.parse('{% blah "foobar" barfoo %}', { blah: {} }))
      .to.eql([{
        type: parser.TOKEN_TYPES.LOGIC,
        line: 1,
        name: 'blah',
        args: ['"foobar"', 'barfoo'],
        compile: {},
        strip: { before: false, after: false, start: false, end: false },
        parent: []
      }]);
  });

  it('can require end tags', function () {
    expect(parser.parse('{% blah %}{% endblah %}', { blah: { ends: true } }))
      .to.eql([{
        type: parser.TOKEN_TYPES.LOGIC,
        line: 1,
        name: 'blah',
        args: [],
        compile: { ends: true },
        tokens: [],
        strip: { before: false, after: false, start: false, end: false },
        parent: []
      }]);
  });

  it('can span multiple lines', function () {
    expect(parser.parse('{% blah \n arg1 %}{% endblah\n %}', { blah: { ends: true } }))
      .to.eql([{
        type: parser.TOKEN_TYPES.LOGIC,
        line: 1,
        name: 'blah',
        args: ['arg1'],
        compile: { ends: true },
        tokens: [],
        strip: { before: false, after: false, start: false, end: false },
        parent: []
      }]);
  });

  it('includes the line number in the token', function () {
    expect(parser.parse('hi!\n\n\n{% blah %}{% endblah %}', { blah: { ends: true } })[1])
      .to.eql({
        type: parser.TOKEN_TYPES.LOGIC,
        line: 4,
        name: 'blah',
        args: [],
        compile: { ends: true },
        tokens: [],
        strip: { before: false, after: false, start: false, end: false },
        parent: []
      });
  });

  it('throws if should have end but no end found', function () {
    var fn = function () {
      parser.parse('{% blah %}', { blah: { ends: true }});
    };
    expect(fn).to.throwException();
  });

  it('throws if not end but end found', function () {
    var fn = function () {
      parser.parse('{% blah %}{% endblah %}', { blah: {}});
    };
    expect(fn).to.throwException();
  });

  it('throws on unbalanced end tag', function () {
    var fn = function () {
      parser.parse('{% blah %}{% endfoo %}', { blah: { ends: true }, foo: { ends: true }});
    };
    expect(fn).to.throwException();
  });

  it('tag with contents', function () {
    expect(parser.parse('{% blah %}hello{% endblah %}', { blah: { ends: true } }))
      .to.eql([{
        type: parser.TOKEN_TYPES.LOGIC,
        line: 1,
        name: 'blah',
        args: [],
        compile: { ends: true },
        tokens: ['hello'],
        strip: { before: false, after: false, start: false, end: false },
        parent: []
      }]);
  });

  describe('arguments', function () {
    it('can be a string', function () {
      expect(parser.parse('{% foo "hi" %}', { foo: {} })[0].args)
        .to.eql(['"hi"']);
    });

    it('can be a string with spaces', function () {
      expect(parser.parse('{% foo "hi mom" %}', { foo: {} })[0].args)
        .to.eql(['"hi mom"']);
    });

    it('random chars', function () {
      expect(parser.parse('{% foo "{" "[" & ^ ; * , a "]" "}" %}', { foo: {} })[0].args)
        .to.eql([
          '"{"', '"["', '&', '^', ';', '*', ',', 'a', '"]"', '"}"'
        ]);
    });

    it('string with comma', function () {
      expect(parser.parse('{% foo "hi,mom" %}', { foo: {} })[0].args)
        .to.eql(['"hi,mom"']);
    });

    it('double-quote string with comma', function () {
      expect(parser.parse('{% foo "hi\", \"mom" %}', { foo: {} })[0].args)
        .to.eql(['"hi\", \"mom"']);
    });

    it('single-quote string with comma', function () {
      expect(parser.parse("{% foo 'hi\', \'mom' %}", { foo: {} })[0].args)
        .to.eql(['\'hi\', \'mom\'']);
    });

    it('empty array', function () {
      expect(parser.parse("{% foo [] %}", { foo: {} })[0].args)
        .to.eql(['[]']);
    });

    it('empty object', function () {
      expect(parser.parse("{% foo {} %}", { foo: {} })[0].args)
        .to.eql(['{}']);
    });

    it('array', function () {
      expect(parser.parse("{% foo ['hi', 'your', 'mom'] %}", { foo: {} })[0].args)
        .to.eql(['[\'hi\', \'your\', \'mom\']']);
    });

    it('object', function () {
      expect(parser.parse("{% foo { 'foo': 1, 'bar': true } %}", { foo: {} })[0].args)
        .to.eql(['{ \'foo\': 1, \'bar\': true }']);
    });

    it('combo', function () {
      expect(parser.parse("{% foo { 'bar': true } 'foo' [] %}", { foo: {} })[0].args)
        .to.eql(['{ \'bar\': true }', "'foo'", '[]']);
    });
  });

  it('throws on bad argument format', function () {
    var fn = function () {
      parser.parse('{% foo "blah is foo %}', { foo: {} });
    };
    expect(fn).to.throwException();
  });
});


describe('Whitespace', function () {
  beforeEach(function () {
    var tags = {
      foo: function (indent) {
        return parser.compile.apply(this, [indent + '  ']);
      },
      bar: function (indent) {
        return '';
      }
    };
    tags.foo.ends = true;
    swig.init({
      tags: tags,
      allowErrors: true
    });
  });

  it('whitespace before', function () {
    expect(swig.compile('{% foo -%} foo{% endfoo %}')())
      .to.eql('foo');
  });
  it('whitespace after', function () {
    expect(swig.compile('{% foo %}foo {%- endfoo %}')())
      .to.eql('foo');
  });
  it('whitespace before and after', function () {
    expect(swig.compile('{% foo -%}\n\r\t foo\n\r\t {%- endfoo %}')())
      .to.eql('foo');
  });
  it('previous whitespace removed', function () {
    expect(swig.compile('a  {%- bar %}b')())
      .to.eql('ab');
  });
  it('all whitespace removed', function () {
    expect(swig.compile('a  {%- foo -%} b {%- endfoo -%} c')())
      .to.eql('abc');
  });
  it('whitespace before only up until tag', function () {
    expect(swig.compile('{% foo -%} {% bar %} foo{% endfoo %}')())
      .to.eql(' foo');
  });
  it('whitespace after only up until tag', function () {
    expect(swig.compile('{% foo%}foo {% bar %}{%- endfoo %}')())
      .to.eql('foo ');
  });
});

describe('Comments', function () {
  it('empty strings are ignored', function () {
    expect(parser.parse('')).to.eql([]);
    expect(parser.parse(' ')).to.eql([]);
    expect(parser.parse(' \n')).to.eql([]);
  });

  it('comments are ignored', function () {
    expect(parser.parse('{# foobar #}')).to.eql([]);
  });

  it('can contain anything and will be ignored', function () {
    expect(parser.parse('{# foo {% blah %} #}')).to.eql([]);
    expect(parser.parse('{# this is a multiline\n comment #}')).to.eql([]);
  });
});

describe('Variables', function () {

  beforeEach(function () {
    swig.init({ allowErrors: true });
  });

  var token = [{
    type: parser.TOKEN_TYPES.VAR,
    name: 'foobar',
    filters: [],
    escape: false,
    args: null
  }];

  it('can include spaces between open and close tags', function () {
    expect(parser.parse('{{ foobar }}')).to.eql(token);
  });

  it('does not require spaces', function () {
    expect(parser.parse('{{foobar}}')).to.eql(token);
  });

  it('can span lines', function () {
    expect(parser.parse('{{\n foobar \n}}')).to.eql(token);
  });

  describe('accepts varying notation', function () {
    it('can use dot notation', function () {
      expect(swig.compile('{{ a.b.c }}')({ a: { b: { c: 'hi' }} }))
        .to.equal('hi');
    });

    it('can use bracket notation', function () {
      expect(swig.compile('{{ a[0][1] }}')({ a: [['no', 'yes']] }))
        .to.equal('yes');
    });

    it('can mix notation styles', function () {
      expect(swig.compile('{{ a[0].b[1] }}')({ a: [{ b: ['no', 'yes'] }] }))
        .to.equal('yes');
    });

    it('can use really complex notations', function () {
      expect(swig.compile('{{ a[0][h.g.i]["c"].b[d] }}')({ a: { '0': { q: { c: { b: { foo: 'hi!' }}}}}, h: { g: { i: 'q' } }, d: 'foo' })
        )
        .to.equal('hi!');
    });

    it('can use bracket notation with keys containing periods', function () {
      expect(swig.compile('{{ a["b.c"] }}')({ a: {"b.c": "hi"} }))
        .to.equal('hi');
    });
  });

  describe('can use filters', function () {
    it('by name only', function () {
      expect(parser.parse('{{ foobar|awesome }}')).to.eql([{
        type: parser.TOKEN_TYPES.VAR,
        name: 'foobar',
        escape: false,
        args: null,
        filters: [{ name: 'awesome', args: '' }]
      }]);
    });

    it('with arguments', function () {
      expect(parser.parse('{{ foobar|awesome("param", ctxvar, 2) }}')).to.eql([{
        type: parser.TOKEN_TYPES.VAR,
        name: 'foobar',
        escape: false,
        args: null,
        filters: [{ name: 'awesome', args: '"param", ctxvar, 2' }]
      }]);
    });

    it('chained', function () {
      expect(parser.parse('{{ foobar|baz(1)|rad|awesome("param", 2) }}')).to.eql([{
        type: parser.TOKEN_TYPES.VAR,
        name: 'foobar',
        escape: false,
        args: null,
        filters: [
          { name: 'baz', args: '1' },
          { name: 'rad', args: '' },
          { name: 'awesome', args: '"param", 2' }
        ]
      }]);
    });

    it('does not carry filters to subsequent vars', function () {
      expect(parser.parse('{{ foo|baz }}{{ bar }}')).to.eql([
        { type: parser.TOKEN_TYPES.VAR, name: 'foo', filters: [{ name: 'baz', args: '' }], escape: false, args: null },
        { type: parser.TOKEN_TYPES.VAR, name: 'bar', filters: [], escape: false, args: null }
      ]);
    });

    it('accepts varying characters in arguments', function () {
      expect(parser.parse("{{ foo|blah('01a|\"\\',;?./¨œ∑´®†][{}]') }}")[0].filters)
        .to.eql([{ name: 'blah', args: "\'01a|\"\\\\\',;?./¨œ∑´®†][{}]\'" }]);
      expect(parser.parse("{{ foo|blah('01a') }}")[0].filters)
        .to.eql([{ name: 'blah', args: "'01a'" }]);
      expect(parser.parse("{{ foo|blah('|') }}")[0].filters)
        .to.eql([{ name: 'blah', args: "'|'" }]);
      expect(parser.parse("{{ foo|blah('\"') }}")[0].filters)
        .to.eql([{ name: 'blah', args: "'\"'" }]);
      expect(parser.parse('{{ foo|blah("\'") }}')[0].filters)
        .to.eql([{ name: 'blah', args: '"\'"' }]);
      expect(parser.parse("{{ foo|blah(',') }}")[0].filters)
        .to.eql([{ name: 'blah', args: "','" }]);
      expect(parser.parse("{{ foo|blah(';') }}")[0].filters)
        .to.eql([{ name: 'blah', args: "';'" }]);
      expect(parser.parse("{{ foo|blah('?./¨œ∑´®†') }}")[0].filters)
        .to.eql([{ name: 'blah', args: "'?./¨œ∑´®†'" }]);
      expect(parser.parse("{{ foo|blah('[]') }}")[0].filters)
        .to.eql([{ name: 'blah', args: "'[]'" }]);
      expect(parser.parse("{{ foo|blah('[') }}")[0].filters)
        .to.eql([{ name: 'blah', args: "'['" }]);
      expect(parser.parse("{{ foo|blah(']') }}")[0].filters)
        .to.eql([{ name: 'blah', args: "']'" }]);
      expect(parser.parse("{{ foo|blah('{}') }}")[0].filters)
        .to.eql([{ name: 'blah', args: "'{}'" }]);
      expect(parser.parse("{{ foo|blah('{') }}")[0].filters)
        .to.eql([{ name: 'blah', args: "'{'" }]);
      expect(parser.parse("{{ foo|blah('}') }}")[0].filters)
        .to.eql([{ name: 'blah', args: "'}'" }]);

      // Edge cases
      expect(parser.parse("{{ foo|blah('a\", \"b') }}")[0].filters)
        .to.eql([{ name: 'blah', args: "'a\", \"b'" }]);
      expect(parser.parse("{{ foo|blah('a\",\"b') }}")[0].filters)
        .to.eql([{ name: 'blah', args: "'a\",\"b'" }]);
      expect(parser.parse('{{ foo|blah("a\', \'b") }}')[0].filters)
        .to.eql([{ name: 'blah', args: '"a\', \'b"' }]);
      expect(parser.parse('{{ foo|blah("a\',\'b") }}')[0].filters)
        .to.eql([{ name: 'blah', args: '"a\',\'b"' }]);
    });

    it('properly escapes arguments', function () {
      expect(parser.parse('{{ foo|blah("\\s") }}')).to.eql([{
        type: parser.TOKEN_TYPES.VAR,
        name: 'foo',
        filters: [{ name: 'blah', args: '"\\\\s"' }],
        escape: false,
        args: null
      }]);
    });

    it('can have arguments spanning multiple lines', function () {
      swig.init({
        filters: {
          blah: function (value, a, b, c) {
            expect(a).to.equal('a');
            expect(b).to.equal('b');
            expect(c).to.equal('c');
            return [a, b, c].join('');
          }
        }
      });
      expect(swig.compile("{{ foo\n|\nblah(\n'a', \n'b',\n'c'\n) }}")({ foo: true }))
        .to.equal('abc');
    });
  });
});

describe('Compiling', function () {

  beforeEach(function () {
    swig.init({ allowErrors: true });
  });

  it('does not throw if compiler is broken', function () {
    var fn = function () {
      var tpl = {
        tokens: [{
          type: parser.TOKEN_TYPES.VAR,
          name: 'foobar',
          filters: [],
          escape: false,
          args: null
        }]
      };
      eval('var _output = "";' + parser.compile.call(tpl, ''));
    };
    expect(fn).to.not.throwException();
  });

  it('does not throw', function () {
    var fn = function () {
      var tpl = { tokens: parser.parse('{% if foo %}blah{% endif %}', tags) };
      eval('var _output = "";' + parser.compile.call(tpl, ''));
    };
    expect(fn).to.not.throwException();
  });

  it('throws on extends with multiple arguments', function () {
    var fn = function () {
      eval('var _output = "";' + parser.compile.call({
        tokens: parser.parse('{% extends "foo" "bar" %}', tags),
        type: parser.TEMPLATE
      }, ''));
    };
    expect(fn).to.throwException();
  });

  it('throws if extends is not the first token', function () {
    var fn = function () {
      eval('var _output = "";' + parser.compile.call({ tokens: parser.parse('blah!{% extends "foobar" %}', tags), type: parser.TEMPLATE }, ''));
    };
    expect(fn).to.throwException();
  });

  describe('block naming', function () {
    it('does not throw on alpha block name', function () {
      var fn = function () {
        eval('var _output = "";' + parser.compile.call({ tokens: parser.parse('{% block foobar %}{% endblock %}', tags), type: parser.TEMPLATE }, ''));
      };
      expect(fn).to.not.throwException();
    });

    it('throws on non alpha block name', function () {
      var fn = function () {
        eval('var _output = "";' + parser.compile.call({ tokens: parser.parse('{% block 123 %}{% endblock %}', tags), type: parser.TEMPLATE }, ''));
      };
      expect(fn).to.throwException();
    });
  });

  it('does not remove duplicate strings when extended', function () {
    swig.compile('"{{ e }}"{{ f }}"{{ g }}"{{ h }}', { filename: 'foo' });
    expect(swig.compile('{% extends "foo" %}')({ e: 'e', f: 'f', g: 'g', h: 'h' })).to.equal('"e"f"g"h');
  });

});
