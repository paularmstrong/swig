var swig = require('../../lib/swig'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

var cases = [
  { code: '= 1', result: '1' },
  { code: '= "burritos"', result: 'burritos' },
  { code: '= 1 + 3', result: '4' },
  { code: '+= 4', result: '5' },
  { code: '-= 1', result: '0' },
  { code: '*= 3', result: '3' },
  { code: '/= 2', result: '0.5' },
  { code: '= bar|default(1)', result: '1' }
];

describe('Tag: set', function () {

  _.each(cases, function (c) {
    var s = '{% set foo ' + c.code + ' %}';
    it(s, function () {
      expect(swig.render(s + '{{ foo }}', { locals: { foo: 1 }})).to.equal(c.result);
    });
  });

  it('throws on incorrect assignments', function () {
    expect(function () {
      swig.render('{% set = foo %}');
    }).to.throwError(/Unexpected assignment "=" on line 1\./);
    expect(function () {
      swig.render('{% set blah = foo /= foo %}');
    }).to.throwError(/Unexpected assignment "\/=" on line 1\./);
  });
});
