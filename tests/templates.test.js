var fs = require('fs'),
  swig = require('../index.js'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

function isTest(f) {
  return (/\.test\.html$/).test(f);
}

function isExpectation(f) {
  return (/\.expectation\.html$/).test(f);
}

describe('Templates', function () {
  var casefiles = fs.readdirSync(__dirname + '/cases/'),
    tests = _.filter(casefiles, isTest),
    expectations = _.filter(casefiles, isExpectation),
    cases = _.groupBy(tests.concat(expectations), function (f) {
      return f.split('.')[0];
    }),
    locals = {
      first: 'Tacos',
      second: 'Burritos'
    };

  _.each(cases, function (files, c) {
    var test = _.find(files, isTest),
      expectation = fs.readFileSync(__dirname + '/cases/' + _.find(files, isExpectation), 'utf8');

    it(c, function () {
      expect(swig.compileFile(__dirname + '/cases/' + test)(locals)).to.equal(expectation);
    });
  });
});
