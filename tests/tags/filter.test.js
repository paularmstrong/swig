var swig = require('../../lib/swig'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

var cases = [
  { c: 'upper', e: 'PASS' },
  { c: 'default("foobar")', e: 'pass' },
  { c: 'replace("s", "d", "g")', e: 'padd' },
  { c: 'default(fn("foo"))', e: 'pass' },
  { c: 'default(foo)', e: 'pass' }
];

describe('Tag: filter', function () {
  _.each(cases, function (c) {
    it('{% filter ' + c.c + ' %}', function () {
      expect(swig.render('{% filter ' + c.c + '%}pass{% endfilter %}', { locals: {
        fn: function (input) { return input; }
      }}))
        .to.equal(c.e);
    });
  });

  it('throws on non-existent filter', function () {
    expect(function () {
      swig.render('{% filter foobar %}{% endfilter %}');
    }).to.throwError(/Filter \"foobar\" does not exist on line 1\./);
  });

  it("gh-547: Filters with same name in different instances", function () {

    var s1 = new Swig(),
      s2 = new Swig();

    s1.setFilter('foo', function () { return 'foo1'; });
    s2.setFilter('foo', function () { return 'foo2'; });

    expect(s1.render('{% filter foo %}{% endfilter %}')).to.equal('foo1');
    expect(s1.compile('{% filter foo %}{% endfilter %}')({})).to.equal('foo1');
    expect(s2.render('{% filter foo %}{% endfilter %}')).to.equal('foo2');
    expect(s2.compile('{% filter foo %}{% endfilter %}')({})).to.equal('foo2');
  });

});
