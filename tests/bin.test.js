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
  });

describe('bin/swig -v', function () {
  it('shows the version number', function (done) {
    exec(bin + ' -v', function (err, stdout, stderr) {
      expect((/^\d+\.\d+\.\d+/).test(stdout)).to.equal(true);
      done();
    });
  });
});

describe('bin/swig render', function () {
  _.each(cases, function (files, c) {
    var test = _.find(files, isTest),
      expectation = fs.readFileSync(__dirname + '/cases/' + _.find(files, isExpectation), 'utf8');

    it(c, function (done) {
      exec(bin + ' render ./tests/cases/' + test + ' -j ' + __dirname + '/bin.locals.json', function (err, stdout, stderr) {
        expect(stdout.replace(/\n$/, '')).to.equal(expectation);
        done();
      });
    });
  });
});

describe('bin/swig compile + run', function () {
  _.each(cases, function (files, c) {
    var test = _.find(files, isTest),
      expectation = fs.readFileSync(__dirname + '/cases/' + _.find(files, isExpectation), 'utf8');

    it(c, function (done) {
      exec(bin + ' compile ./tests/cases/' + test + ' -j ' + __dirname + '/bin.locals.json -o ../tmp', function (err, stdout, stderr) {
        exec(bin + ' run ../tmp/' + test + ' -c ' + __dirname + '/bin.locals.js', function (err, stdout, stdrr) {
          expect(stdout.replace(/\n$/, '')).to.equal(expectation);
          done();
        });
      });
    });
  });
});

describe('bin/swig compile -m', function () {
  it('minifies output', function (done) {
    exec(bin + ' compile ./tests/cases/extends_1.test.html -m', function (err, stdout, stderr) {
      expect(stdout).to.equal('var tpl=function(n){var e=(n.extensions,"");return e+="Hi,\\n\\n",e+="This is the body.",e+="\\n\\nSincerely,\\nMe\\n"};\n');
      done();
    });
  });
});

describe('bin/swig compile & run from swig', function () {
  it('can be run', function (done) {
    var expectation = fs.readFileSync(__dirname + '/cases/extends_1.expectation.html', 'utf8');
    exec(bin + ' compile ./tests/cases/extends_1.test.html -o ../tmp --wrap-start="var foo = "', function (err, stdout, stderr) {
      fs.readFile(__dirname + '/../../tmp/extends_1.test.html', 'utf8', function (err, stdout) {
        var foo;
        eval(stdout);
        expect(swig.run(foo)).to.equal(expectation);
        done();
      });
    });
  });
});
