var require = require('../testutils').require,
  expect = require('expect.js'),
  swig = require('../../lib/swig');

describe('Tag: filter', function () {
  beforeEach(function () {
    swig.init({});
  });

  it('accepts a filter as an argument', function () {
    expect(swig.compile('{% filter capitalize %}oh HEY there{% endfilter %}')({}))
      .to.equal('Oh hey there');
  });

  it('works across complex content', function () {
    var tpl = swig.compile('{% filter capitalize %}oh {{ foo }} {% if here %}here{% else %}there{% endif %}{% endfilter %}');
    expect(tpl({ foo: 'HEY', here: true })).to.equal('Oh hey here');
  });

  it('can accept arguments for the filter', function () {
    var tpl = swig.compile('{% filter replace "\\." "!" "g" %}hi. my name is paul.{% endfilter %}');
    expect(tpl({})).to.equal('hi! my name is paul!');
  });

  it('throws if filter does not exist', function () {
    expect(function () { swig.compile('{% filter foobar %}{% endfilter %}'); })
      .to.throwException();
    expect(function () { swig.compile('{{ foo|foobar }}'); })
      .to.throwException();
  });

  it('does not throw for custom filter', function () {
    swig.init({ filters: {
      foo: function (i) { return i; }
    }});
    expect(function () { swig.compile('{% filter foo %}{% endfilter %}'); })
      .to.not.throwException();
    expect(function () { swig.compile('{{ bar|foo }}'); })
      .to.not.throwException();
  });
});
