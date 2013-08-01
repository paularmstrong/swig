var swig = require('../../lib/swig'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

var cases = [
  { c: 'upper', e: 'PASS' },
  { c: 'default("foobar")', e: 'pass' },
  { c: 'replace("s", "d", "g")', e: 'padd' }
];

describe('Tag: filter', function () {
  _.each(cases, function (c) {
    it('{% filter ' + c.c + ' %}', function () {
      expect(swig.render('{% filter ' + c.c + '%}pass{% endfilter %}', {}))
        .to.equal(c.e);
    });
  });

  it('Throws on non-existent filter', function () {
    expect(function () {
      swig.render('{% filter foobar %}{% endfilter %}');
    }).to.throwError(/Filter \"foobar\" does not exist on line 1\./);
  });
});
