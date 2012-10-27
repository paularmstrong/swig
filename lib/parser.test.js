var swig = require('../index'),
  tags = require('./tags'),
  parser = require('./parser');

describe('Tags', function () {
  it('undefined tag throws error', function () {
    var fn = function () {
      parser.parse('{% foobar %}', {});
    };
    fn.should.throw();
  });

  it('creates a token', function () {
    parser.parse('{% blah %}', { blah: {} }).should.eql([{
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
    parser.parse('{% blah "foobar" %}', { blah: {} }).should.eql([{
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
    parser.parse('{% blah "foobar" barfoo %}', { blah: {} }).should.eql([{
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
    parser.parse('{% blah %}{% endblah %}', { blah: { ends: true } }).should.eql([{
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
    parser.parse('{% blah \n arg1 %}{% endblah\n %}', { blah: { ends: true } }).should.eql([{
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
    parser.parse('hi!\n\n\n{% blah %}{% endblah %}', { blah: { ends: true } })[1].should.eql({
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
    fn.should.throw();
  });

  it('throws if not end but end found', function () {
    var fn = function () {
      parser.parse('{% blah %}{% endblah %}', { blah: {}});
    };
    fn.should.throw();
  });

  it('throws on unbalanced end tag', function () {
    var fn = function () {
      parser.parse('{% blah %}{% endfoo %}', { blah: { ends: true }, foo: { ends: true }});
    };
    fn.should.throw();
  });

  it('tag with contents', function () {
    parser.parse('{% blah %}hello{% endblah %}', { blah: { ends: true } }).should.eql([{
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
      parser.parse('{% foo "hi" %}', { foo: {} })[0].args.should.eql(['"hi"']);
    });

    it('can be a string with spaces', function () {
      parser.parse('{% foo "hi mom" %}', { foo: {} })[0].args.should.eql(['"hi mom"']);
    });

    it('random chars', function () {
      parser.parse('{% foo "{" "[" & ^ ; * , a "]" "}" %}', { foo: {} })[0].args.should.eql([
        '"{"', '"["', '&', '^', ';', '*', ',', 'a', '"]"', '"}"'
      ]);
    });

    it('string with comma', function () {
      parser.parse('{% foo "hi,mom" %}', { foo: {} })[0].args.should.eql(['"hi,mom"']);
    });

    it('double-quote string with comma', function () {
      parser.parse('{% foo "hi\", \"mom" %}', { foo: {} })[0].args.should.eql(['"hi\", \"mom"']);
    });

    it('single-quote string with comma', function () {
      parser.parse("{% foo 'hi\', \'mom' %}", { foo: {} })[0].args.should.eql(['\'hi\', \'mom\'']);
    });

    it('empty array', function () {
      parser.parse("{% foo [] %}", { foo: {} })[0].args.should.eql(['[]']);
    });

    it('empty object', function () {
      parser.parse("{% foo {} %}", { foo: {} })[0].args.should.eql(['{}']);
    });

    it('array', function () {
      parser.parse("{% foo ['hi', 'your', 'mom'] %}", { foo: {} })[0].args.should.eql(['[\'hi\', \'your\', \'mom\']']);
    });

    it('object', function () {
      parser.parse("{% foo { 'foo': 1, 'bar': true } %}", { foo: {} })[0].args.should.eql(['{ \'foo\': 1, \'bar\': true }']);
    });

    it('combo', function () {
      parser.parse("{% foo { 'bar': true } 'foo' [] %}", { foo: {} })[0].args.should.eql(['{ \'bar\': true }', "'foo'", '[]']);
    });
  });

  it('throws on bad argument format', function () {
    var fn = function () {
      parser.parse('{% foo "blah is foo %}', { foo: {} });
    };
    fn.should.throw();
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
    swig.compile('{% foo -%} foo{% endfoo %}')().should.eql('foo');
  });
  it('whitespace after', function () {
    swig.compile('{% foo %}foo {%- endfoo %}')().should.eql('foo');
  });
  it('whitespace before and after', function () {
    swig.compile('{% foo -%}\n\r\t foo\n\r\t {%- endfoo %}')().should.eql('foo');
  });
  it('previous whitespace removed', function () {
    swig.compile('a  {%- bar %}b')().should.eql('ab');
  });
  it('all whitespace removed', function () {
    swig.compile('a  {%- foo -%} b {%- endfoo -%} c')().should.eql('abc');
  });
  it('whitespace before only up until tag', function () {
    swig.compile('{% foo -%} {% bar %} foo{% endfoo %}')().should.eql(' foo');
  });
  it('whitespace after only up until tag', function () {
    swig.compile('{% foo%}foo {% bar %}{%- endfoo %}')().should.eql('foo ');
  });
});

describe('Comments', function () {
  it('empty strings are ignored', function () {
    parser.parse('').should.eql([]);
    parser.parse(' ').should.eql([]);
    parser.parse(' \n').should.eql([]);
  });

  it('comments are ignored', function () {
    parser.parse('{# foobar #}').should.eql([]);
  });

  it('can contain anything and will be ignored', function () {
    parser.parse('{# foo {% blah %} #}').should.eql([]);
    parser.parse('{# this is a multiline\n comment #}').should.eql([]);
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
    parser.parse('{{ foobar }}').should.eql(token);
  });

  it('does not require spaces', function () {
    parser.parse('{{foobar}}').should.eql(token);
  });

  describe('accepts varying notation', function () {
    it('can use dot notation', function () {
      swig.compile('{{ a.b.c }}')({ a: { b: { c: 'hi' }} }).should.equal('hi');
    });

    it('can use bracket notation', function () {
      swig.compile('{{ a[0][1] }}')({ a: [['no', 'yes']] }).should.equal('yes');
    });

    it('can mix notation styles', function () {
      swig.compile('{{ a[0].b[1] }}')({ a: [{ b: ['no', 'yes'] }] }).should.equal('yes');
    });

    it('can use really complex notations', function () {
      swig.compile('{{ a[0][h.g.i]["c"].b[d] }}')({ a: { '0': { q: { c: { b: { foo: 'hi!' }}}}}, h: { g: { i: 'q' } }, d: 'foo' })
        .should.equal('hi!');
    });

    it('can use bracket notation with keys containing periods', function () {
      swig.compile('{{ a["b.c"] }}')({ a: {"b.c": "hi"} }).should.equal('hi');
    });
  });

  describe('can use filters', function () {
    it('by name only', function () {
      parser.parse('{{ foobar|awesome }}').should.eql([{
        type: parser.TOKEN_TYPES.VAR,
        name: 'foobar',
        escape: false,
        args: null,
        filters: [{ name: 'awesome', args: '' }]
      }]);
    });

    it('with arguments', function () {
      parser.parse('{{ foobar|awesome("param", ctxvar, 2) }}').should.eql([{
        type: parser.TOKEN_TYPES.VAR,
        name: 'foobar',
        escape: false,
        args: null,
        filters: [{ name: 'awesome', args: '"param", ctxvar, 2' }]
      }]);
    });

    it('chained', function () {
      parser.parse('{{ foobar|baz(1)|rad|awesome("param", 2) }}').should.eql([{
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
      parser.parse('{{ foo|baz }}{{ bar }}').should.eql([
        { type: parser.TOKEN_TYPES.VAR, name: 'foo', filters: [{ name: 'baz', args: '' }], escape: false, args: null },
        { type: parser.TOKEN_TYPES.VAR, name: 'bar', filters: [], escape: false, args: null }
      ]);
    });

    it('accepts varying characters in arguments', function () {
      parser.parse("{{ foo|blah('01a|\"\\',;?./¨œ∑´®†][{}]') }}")[0].filters.should.eql([{ name: 'blah', args: "\'01a|\"\\\\\',;?./¨œ∑´®†][{}]\'" }]);
      parser.parse("{{ foo|blah('01a') }}")[0].filters.should.eql([{ name: 'blah', args: "'01a'" }]);
      parser.parse("{{ foo|blah('|') }}")[0].filters.should.eql([{ name: 'blah', args: "'|'" }]);
      parser.parse("{{ foo|blah('\"') }}")[0].filters.should.eql([{ name: 'blah', args: "'\"'" }]);
      parser.parse('{{ foo|blah("\'") }}')[0].filters.should.eql([{ name: 'blah', args: '"\'"' }]);
      parser.parse("{{ foo|blah(',') }}")[0].filters.should.eql([{ name: 'blah', args: "','" }]);
      parser.parse("{{ foo|blah(';') }}")[0].filters.should.eql([{ name: 'blah', args: "';'" }]);
      parser.parse("{{ foo|blah('?./¨œ∑´®†') }}")[0].filters.should.eql([{ name: 'blah', args: "'?./¨œ∑´®†'" }]);
      parser.parse("{{ foo|blah('[]') }}")[0].filters.should.eql([{ name: 'blah', args: "'[]'" }]);
      parser.parse("{{ foo|blah('[') }}")[0].filters.should.eql([{ name: 'blah', args: "'['" }]);
      parser.parse("{{ foo|blah(']') }}")[0].filters.should.eql([{ name: 'blah', args: "']'" }]);
      parser.parse("{{ foo|blah('{}') }}")[0].filters.should.eql([{ name: 'blah', args: "'{}'" }]);
      parser.parse("{{ foo|blah('{') }}")[0].filters.should.eql([{ name: 'blah', args: "'{'" }]);
      parser.parse("{{ foo|blah('}') }}")[0].filters.should.eql([{ name: 'blah', args: "'}'" }]);

      // Edge cases
      parser.parse("{{ foo|blah('a\", \"b') }}")[0].filters.should.eql([{ name: 'blah', args: "'a\", \"b'" }]);
      parser.parse("{{ foo|blah('a\",\"b') }}")[0].filters.should.eql([{ name: 'blah', args: "'a\",\"b'" }]);
      parser.parse('{{ foo|blah("a\', \'b") }}')[0].filters.should.eql([{ name: 'blah', args: '"a\', \'b"' }]);
      parser.parse('{{ foo|blah("a\',\'b") }}')[0].filters.should.eql([{ name: 'blah', args: '"a\',\'b"' }]);
    });

    it('properly escapes arguments', function () {
      parser.parse('{{ foo|blah("\\s") }}').should.eql([{
        type: parser.TOKEN_TYPES.VAR,
        name: 'foo',
        filters: [{ name: 'blah', args: '"\\\\s"' }],
        escape: false,
        args: null
      }]);
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
    fn.should.not.throw();
  });

  it('does not throw', function () {
    var fn = function () {
      var tpl = { tokens: parser.parse('{% if foo %}blah{% endif %}', tags) };
      eval('var _output = "";' + parser.compile.call(tpl, ''));
    };
    fn.should.not.throw();
  });

  it('throws on extends with multiple arguments', function () {
    var fn = function () {
      eval('var _output = "";' + parser.compile.call({
        tokens: parser.parse('{% extends "foo" "bar" %}', tags),
        type: parser.TEMPLATE
      }, ''));
    };
    fn.should.throw();
  });

  it('throws if extends is not the first token', function () {
    var fn = function () {
      eval('var _output = "";' + parser.compile.call({ tokens: parser.parse('blah!{% extends "foobar" %}', tags), type: parser.TEMPLATE }, ''));
    };
    fn.should.throw();
  });

  describe('block naming', function () {
    it('does not throw on alpha block name', function () {
      var fn = function () {
        eval('var _output = "";' + parser.compile.call({ tokens: parser.parse('{% block foobar %}{% endblock %}', tags), type: parser.TEMPLATE }, ''));
      };
      fn.should.not.throw();
    });

    it('throws on non alpha block name', function () {
      var fn = function () {
        eval('var _output = "";' + parser.compile.call({ tokens: parser.parse('{% block 123 %}{% endblock %}', tags), type: parser.TEMPLATE }, ''));
      };
      fn.should.throw();
    });
  });

  it('does not remove duplicate strings when extended', function () {
    swig.compile('"{{ e }}"{{ f }}"{{ g }}"{{ h }}', { filename: 'foo' });
    swig.compile('{% extends "foo" %}')({ e: 'e', f: 'f', g: 'g', h: 'h' }).should.equal('"e"f"g"h');
  });

});
