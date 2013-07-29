var swig = require('../index.js'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

var n = new Swig(),
  oDefaults = n.options,
  cases = {
    'addslashes': [
      {
        c: 'v|addslashes',
        l: { v: "\"Top O' the\\ mornin\""},
        e: "\\&quot;Top O\\&#39; the\\\\ mornin\\&quot;"
      },
      {
        c: 'v|addslashes',
        l: { v: ["\"Top", "O'", "the\\", "mornin\""] },
        e: "\\\"Top,O\\',the\\\\,mornin\\\""
      }
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

  describe('raw', function () {
    it('{{ "<foo>"|raw }}', function () {
      expect(swig.render('{{ "<foo>"|raw }}')).to.equal('<foo>');
      expect(swig.render('{{ "<foo>"|raw() }}')).to.equal('<foo>');
    });

    it('{{ "<&>"|raw }}', function () {
      var opts = { locals: { foo: '<&>' }};
      expect(swig.render('{{ foo|raw }}', opts)).to.equal('<&>');
      expect(swig.render('{{ foo|raw() }}', opts)).to.equal('<&>');
    });
  });

  _.each(cases, function (cases, filter) {
    describe(filter, function () {
      _.each(cases, function (c) {
        it('{{ ' + c.c + ' }}', function () {
          expect(swig.render('{{ ' + c.c + ' }}', { locals: c.l }))
            .to.equal(c.e);
        });
      });
    });
  });

});
