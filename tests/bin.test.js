var fs = require('fs'),
  exec = require('child_process').exec,
  swig = require('../lib/swig'),
  expect = require('expect.js'),
  _ = require('lodash'),
  path = require('path'),
  bin = path.normalize(__dirname + '/../bin/swig.js');

function isTest(f) {
  return (/\.test\.html$/).test(f);
}

function isExpectation(f) {
  return (/\.expectation\.html$/).test(f);
}

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

describe('bin/swig build', function () {
  _.each(cases, function (files, c) {
    var test = _.find(files, isTest),
      expectation = fs.readFileSync(__dirname + '/cases/' + _.find(files, isExpectation), 'utf8');

    it(c, function (done) {
      exec(bin + ' build ./tests/cases/' + test + ' -j ' + __dirname + '/bin.locals.json', function (err, stdout, stderr) {
        expect(stdout.replace(/\n$/, '')).to.equal(expectation);
        done();
      });
    });
  });
});

describe('bin/swig compile + render', function () {
  _.each(cases, function (files, c) {
    var test = _.find(files, isTest),
      expectation = fs.readFileSync(__dirname + '/cases/' + _.find(files, isExpectation), 'utf8');

    it(c, function (done) {
      exec(bin + ' compile ./tests/cases/' + test + ' -j ' + __dirname + '/bin.locals.json -o ../tmp', function (err, stdout, stderr) {
        exec(bin + ' render ../tmp/' + test + ' -c ' + __dirname + '/bin.locals.js', function (err, stdout, stdrr) {
          expect(stdout.replace(/\n$/, '')).to.equal(expectation);
          done();
        });
      });
    });
  });
});
