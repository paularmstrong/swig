var swig = require('../index.js'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

var n = new Swig(),
  oDefaults = n.options,
  cases = {
    addslashes: [
      {
        v: "\"Top O' the\\ mornin\"",
        e: "\\&quot;Top O\\&#39; the\\\\ mornin\\&quot;"
      },
      {
        v: ["\"Top", "O'", "the\\", "mornin\""],
        e: "\\\"Top,O\\',the\\\\,mornin\\\""
      }
    ],
    capitalize: [
      { v: 'awesome sAuce.', e: 'Awesome sauce.' },
      { v: 345, e: '345' },
      { v: ['foo', 'bar'], e: 'Foo,Bar' }
    ],
    'default': [
      { c: 'v|default("tacos")', v: 'foo', e: 'foo' },
      { c: 'v|default("tacos")', v: 0, e: '0' },
      { c: 'v|default("tacos")', v: '', e: 'tacos' },
      { c: 'v|default("tacos")', v: undefined, e: 'tacos' },
      { c: 'v|default("tacos")', v: null, e: 'tacos' },
      { c: 'v|default("tacos")', v: false, e: 'tacos' },
    ],
    first: [
      { v: [1, 2, 3, 4], e: '1' },
      { v: '213', e: '2' },
      { v: { foo: 'blah' }, e: '' }
    ],
    join: [
      { c: 'v|join("+")', v: [1, 2, 3], e: '1+2+3' },
      { c: 'v|join(" * ")', v: [1, 2, 3], e: '1 * 2 * 3' },
      { c: 'v|join(",")', v: [1, 2, 3], e: '1,2,3' },
      { c: 'v|join(", ")', v: { f: 1, b: 2, z: 3 }, e: '1, 2, 3' },
      { c: 'v|join("-")', v: 'asdf', e: 'asdf' }
    ],
    json: [
      { v: { foo: 'bar', baz: [1, 2, 3] }, e: '{&quot;foo&quot;:&quot;bar&quot;,&quot;baz&quot;:[1,2,3]}' },
      { c: 'v|json(2)', v: { foo: 'bar', baz: [1, 2, 3] }, e: '{\n  &quot;foo&quot;: &quot;bar&quot;,\n  &quot;baz&quot;: [\n    1,\n    2,\n    3\n  ]\n}'}
    ],
    last: [
      { v: [1, 2, 3, 4], e: '4' },
      { v: '123', e: '3' },
      { v: { foo: 'blah', bar: 'nope' }, e: ''}
    ],
    lower: [
      { v: 'BaR', e: 'bar' },
      { v: '345', e: '345' },
      { v: ['FOO', 'bAr'], e: 'foo,bar' },
      { c: 'v|lower|join("")', v: { foo: 'BAR' }, e: 'bar' }
    ],
    raw: [
      { c: 'v|raw', v: '<&>', e: '<&>' },
      { c: 'v|first|raw', v: ['<&>'], e: '<&>' },
      { c: 'v|raw|lower', v: '<&>fOo', e: '<&>foo' }
    ],
    replace: [
      { c: 'v|replace("o", "a")', v: 'foo', e: 'fao' },
      { c: 'v|replace("o", "", "g")', v: 'fooboo', e: 'fb' },
      { c: 'v|replace("\\W+", "-")', v: '$*&1aZ', e: '-1aZ' }
    ],
    reverse: [
      { c: 'v|reverse', v: [1, 2, 3], e: '3,2,1' },
      { c: 'v|reverse', v: 'asdf', e: 'asdf' },
      { c: 'v|reverse|join("")', v: { foo: 'bar', baz: 'bop' }, e: 'barbop' }
    ]
  };

function resetOptions() {
  swig.setDefaults(oDefaults);
  swig.invalidateCache();
}

describe('Filters:', function () {
  beforeEach(resetOptions);
  afterEach(resetOptions);

  it('can be added', function () {
    swig.addFilter('foo', function () { return 3; });
    expect(swig.render('{{ b|foo() }}')).to.equal('3');
  });

  it('can accept params', function () {
    swig.addFilter('foo', function (inp, arg) { return arg; });
    expect(swig.render('{{ b|foo(3) }}')).to.equal('3');
  });

  it('can be very complexly nested', function () {
    expect(swig.render('{{ b|default(c|default("3")) }}')).to.equal('3');
  });

  _.each(cases, function (cases, filter) {
    describe(filter, function () {
      _.each(cases, function (c) {
        var code = '{{ ' + (c.c || 'v|' + filter) + ' }}';
        it(code + ', v=' + JSON.stringify(c.v) + ' should render ' + c.e.replace(/\n/g, '\\n'), function () {
          expect(swig.render(code, { locals: { v: c.v }}))
            .to.equal(c.e);
        });
      });
    });
  });

});
