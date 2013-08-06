var fs = require('fs'),
  path = require('path'),
  file = require('file'),
  swig = require('../lib/swig'),
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
  var casefiles = [],
    locals = {
      first: 'Tacos',
      second: 'Burritos',
      includefile: "./includes.html"
    },
    tests,
    expectations,
    cases;

  file.walkSync(__dirname + '/cases/', function (start, dirs, files) {
    _.each(files, function (f) {
      return casefiles.push(path.normalize(start + '/' + f));
    });
  });

  tests = _.filter(casefiles, isTest);
  expectations = _.filter(casefiles, isExpectation);
  cases = _.groupBy(tests.concat(expectations), function (f) {
    return f.split('.')[0];
  });

  _.each(cases, function (files, c) {
    var test = _.find(files, isTest),
      expectation = fs.readFileSync(_.find(files, isExpectation), 'utf8');

    it(c, function () {
      expect(swig.compileFile(test)(locals)).to.equal(expectation);
    });
  });

  describe('renderFile', function () {
    var expectation = fs.readFileSync(__dirname + '/cases/extends_1.expectation.html', 'utf8'),
      opts = { locals: locals };

    it('renders files immediately', function () {
      expect(swig.renderFile(__dirname + '/cases/extends_1.test.html', opts)).to.equal(expectation);
    });

    it('throws immediately with no callback', function () {
      expect(function () {
        swig.renderFile('foobar');
      }).to.throwError();
    });

    it('can use callbacks', function (done) {
      swig.renderFile(__dirname + '/cases/extends_1.test.html', opts, function (err, out) {
        expect(out).to.equal(expectation);
        done();
      });
    });

    it('can use callbacks with errors', function (done) {
      swig.renderFile(__dirname + '/cases/not-existing', opts, function (err, out) {
        expect(err.errno).to.equal(34);
        done();
      });
    });
  });
});
