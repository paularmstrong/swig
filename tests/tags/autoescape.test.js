var swig = require('../../lib/swig'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

var n = new Swig(),
  oDefaults = n.options;

function resetOptions() {
  swig.setDefaults(oDefaults);
  swig.invalidateCache();
}

describe('Tag: autoescape', function () {

  beforeEach(resetOptions);
  afterEach(resetOptions);

  it('{% autoescape true %} turns escaping on', function () {
    swig.setDefaults({ autoescape: false });
    expect(swig.render('{% autoescape true %}{{ "<foo>" }}{% endautoescape %}{{ "<bar>" }}'))
      .to.equal('&lt;foo&gt;<bar>');
  });

  it('{% autoescape "js" %} escapes for js', function () {
    expect(swig.render('{% autoescape "js" %}{{ \'"special" chars = -1;\' }}{% endautoescape %}'))
      .to.equal('\\u0022special\\u0022 chars \\u003D \\u002D1\\u003B');
  });

  it('{% autoescape false %} turns escaping off', function () {
    swig.setDefaults({ autoescape: true });
    expect(swig.render('{% autoescape false %}{{ "<foo>" }}{% endautoescape %}{{ "<bar>" }}'))
      .to.equal('<foo>&lt;bar&gt;');
  });

  it('{% autoescape whatthewhat %} throws because unknown argument', function () {
    expect(function () {
      swig.render('{% autoescape whatthewhat %}huh?{% endautoescape %}', { filename: 'foobar' });
    }).to.throwError(/Unexpected token "whatthewhat" in autoescape tag on line 1 in file foobar\./);

    expect(function () {
      swig.render('{% autoescape true "html" %}huh?{% endautoescape %}');
    }).to.throwError(/Unexpected token ""html"" in autoescape tag on line 1\./);
  });
});
