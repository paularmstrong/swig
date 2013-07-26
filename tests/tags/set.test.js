var swig = require('../../index.js'),
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
  // TODO
  // { code: '= bar|default(1)', result: '1' }
];

describe('Tag: set', function () {

  _.each(cases, function (c) {
    var s = '{% set foo ' + c.code + ' %}';
    it(s, function () {
      expect(swig.render(s + '{{ foo }}', { locals: { foo: 1 }})).to.equal(c.result);
    });
  });

});
