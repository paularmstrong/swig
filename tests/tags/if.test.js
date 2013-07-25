var swig = require('../../index.js'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

var opts = {
  locals: {
    foo: 1,
    bar: 0
  }
};

var cases = [
  { code: 'foo > bar',    result: true },
  { code: 'foo >= foo',   result: true },
  { code: 'foo >= bar',   result: true },
  { code: 'foo < bar',    result: false },
  { code: 'bar <= bar',   result: true },
  { code: 'foo <= bar',   result: false },
  { code: 'foo !== bar',  result: true },
  { code: 'foo != bar',   result: true }
];

describe('Tag: {% if ', function () {

  _.each(cases, function (c) {
    it(c.code + ' %}', function () {
      expect(swig.render('{% if ' + c.code + '%}pass{% endif %}', opts))
        .to.equal(c.result ? 'pass' : '');
    });
  });

});
