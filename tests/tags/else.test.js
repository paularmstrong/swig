var swig = require('../../index.js'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;


var cases = [
  { code: 'true',  result: false },
  { code: 'false', result: true }
];

describe('Tag: else', function () {

  _.each(cases, function (c) {
    it('{% if ' + c.code + ' %}{% else %}', function () {
      expect(swig.render('{% if ' + c.code + '%}{% else %}pass{% endif %}'))
        .to.equal(c.result ? 'pass' : '');
    });
  });

  it('must be within an {% if %}', function () {
    expect(function () {
      swig.render('{% else %}foo');
    }).to.throwError(/Unexpected tag "else" on line 1\./);
  });

});
