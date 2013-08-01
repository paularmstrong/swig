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

  it('{% autoescape false %} turns escaping off', function () {
    swig.setDefaults({ autoescape: true });
    expect(swig.render('{% autoescape false %}{{ "<foo>" }}{% endautoescape %}{{ "<bar>" }}'))
      .to.equal('<foo>&lt;bar&gt;');
  });

});
