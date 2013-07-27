var swig = require('../../index.js'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

var opts = {
    locals: {
      b: [1, 2, 3]
    }
  },
  cases = [
    { input: '{% for a in b %}{{ a }}{% endfor %}', out: '123' }
  ];

describe('Tag: for', function () {

  _.each(cases, function (c) {
    it(c.input, function () {
      expect(swig.render(c.input, opts)).to.equal(c.out);
    });
  });

});
