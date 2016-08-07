var swig = require('../../lib/swig'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

var leftCases = [
  'foo[bar]',
  'foo[\'bar\']',
  'foo["bar"]',
  'foo[\'bar.baz\']',
  'foo["bar.baz"]',
  'foo[\'bar=baz\']',
  'foo["bar=baz"]',
  'baz.bar',
  'baz.bar.baz',
  'baz["bar"].baz'
];

var rightCases = [
  { code: '= 1', result: '1' },
  { code: '= "burritos"', result: 'burritos' },
  { code: '= 1 + 3', result: '4' },
  { code: '+= 4', result: '5' },
  { code: '-= 1', result: '0' },
  { code: '*= 3', result: '3' },
  { code: '/= 2', result: '0.5' },
  { code: '= bar|default(1)', result: '1' },
  { code: '= foo === 1', result: 'true' },
  { code: '= 1 === 1 and not false', result: 'true' }
];

describe('Tag: set', function () {

  _.each(leftCases, function (c) {
    var s = '{% set bar = "bar" %}{% set ' + c + ' = "con queso" %}';
    it(s, function () {
      expect(swig.render(s + '{{ ' + c + ' }}', { locals: { foo: {}, baz: { bar: {}} }})).to.equal('con queso');
    });
  });

  _.each(rightCases, function (c) {
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
    expect(function () {
      swig.render('{% set .foo = "bar" %}');
    }).to.throwError();
  });
});
