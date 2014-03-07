var swig = require('../../lib/swig'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

var opts = {
  locals: {
    foo: 1,
    bar: 0,
    baz: [1]
  }
};

var cases = [
  { code: 'foo',                result: true },
  { code: 'true',               result: true },
  { code: 'false',              result: false },
  { code: 'foo > bar',          result: true },
  { code: 'foo gt bar',         result: true },
  { code: 'foo >= foo',         result: true },
  { code: 'foo gte bar',        result: true },
  { code: 'foo >= bar',         result: true },
  { code: 'foo < bar',          result: false },
  { code: 'foo lt bar',         result: false },
  { code: 'bar <= bar',         result: true },
  { code: 'foo <= bar',         result: false },
  { code: 'foo lte bar',        result: false },
  { code: 'foo !== bar',        result: true },
  { code: 'foo != bar',         result: true },
  { code: '!foo',               result: false },
  { code: 'not foo',            result: false },
  { code: '!bar',               result: true },
  { code: 'not bar',            result: true },
  { code: 'foo in baz',         result: false },
  { code: 'bar in baz',         result: true },
  { code: '1 < 0',              result: false },
  { code: '"a" === "a"',        result: true },
  { code: '1 === foo',          result: true },
  { code: '1 === bar',          result: false },
  { code: 'true && false',      result: false },
  { code: '0 || (bar && foo)',  result: false },
  { code: 'not (2 in baz)',     result: true }
];

describe('Tag: if', function () {

  _.each(cases, function (c) {
    it('{% if ' + c.code + ' %}', function () {
      expect(swig.render('{% if ' + c.code + '%}pass{% endif %}', opts))
        .to.equal(c.result ? 'pass' : '');
    });
  });

  it('requires a conditional', function () {
    expect(function () {
      swig.render('{% if %}tacos{% endif %}');
    }).to.throwError(/No conditional statement provided on line 1\./);
  });

  it('throws on bad logic', function () {
    var baddies = [
      [ '{% if && foo %}{% endif %}', /Unexpected logic "\&\&" on line 1\./ ],
      [ '{% if foo && %}{% endif %}', /Unexpected logic "\&\&" on line 1\./ ],
      [ '{% if foo > %}{% endif %}', /Unexpected logic ">" on line 1\./ ],
      [ '{% if foo ! %}{% endif %}', /Unexpected logic "\!" on line 1\./ ],
      [ '{% if foo not in bar %}{% endif %}', /Attempted logic "not in" on line 1\. Use \!\(foo in\) instead\./ ]
    ];
    _.each(baddies, function (b) {
      expect(function () {
        swig.render(b[0], opts);
      }).to.throwError(b[1]);
    });
  });

});
