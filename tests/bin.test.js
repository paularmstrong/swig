var fs = require('fs'),
  exec = require('child_process').exec,
  swig = require('../lib/swig'),
  expect = require('expect.js'),
  _ = require('lodash'),
  path = require('path'),
  bin = __dirname + '/../bin/swig.js';

function fixPath(p) {
  p = path.normalize(p);
  return (/[A-Z]\:\\/).test(p) ? '"' + p + '"' : p;
}

bin = fixPath(bin);

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
  keys = _.keys(cases);

describe('bin/swig -v', function () {
  it('shows the version number', function (done) {
    exec('node ' + bin + ' -v', function (err, stdout, stderr) {
      expect((/^\d+\.\d+\.\d+/).test(stdout)).to.equal(true);
      done();
    });
  });
});

describe('bin/swig render', function () {
  var locals = fixPath(__dirname + '/bin.locals.json'),
    key = keys[_.random(keys.length - 1)],
    testcase = cases[key],
    test = fixPath(__dirname + '/cases/' + _.find(testcase, isTest)),
    expectation = fs.readFileSync(path.normalize(__dirname + '/cases/' + _.find(testcase, isExpectation)), 'utf8');

  it(key, function (done) {
    exec('node ' + bin + ' render ' + test + ' -j ' + locals, function (err, stdout, stderr) {
      expect(stdout.replace(/\n$/, '')).to.equal(expectation);
      done();
    });
  });
});

describe('bin/swig compile + run', function () {
  var locals = fixPath(__dirname + '/bin.locals.json'),
    key = keys[_.random(keys.length - 1)],
    testcase = cases[key],
    test = _.find(testcase, isTest),
    p = fixPath(__dirname + '/cases/' + test),
    expectation = fs.readFileSync(path.normalize(__dirname + '/cases/' + _.find(testcase, isExpectation)), 'utf8');

  it(key, function (done) {
    var tmp = fixPath(__dirname + '/../tmp');
    exec('node ' + bin + ' compile ' + p + ' -j ' + locals + ' -o ' + tmp, function (err, stdout, stderr) {
      var p = fixPath(__dirname + '/../tmp/' + test),
        locals = fixPath(__dirname + '/bin.locals.js');
      exec('node ' + bin + ' run ' + p + ' -c ' + locals, function (err, stdout, stdrr) {
        expect(stdout.replace(/\n$/, '')).to.equal(expectation);
        done();
      });
    });
  });
});

describe('bin/swig compile -m', function () {
  it('minifies output', function (done) {
    var p = fixPath(__dirname + '/cases/extends_1.test.html');
    exec('node ' + bin + ' compile ' + p + ' -m', function (err, stdout, stderr) {
      expect(stdout).to.equal('var tpl=function(n){var e=(n.extensions,"");return e+="Hi,\\n\\n",e+="This is the body.",e+="\\n\\nSincerely,\\nMe\\n"};\n');
      done();
    });
  });
});

describe('bin/swig compile & run from swig', function () {
  it('can be run', function (done) {
    var expectation = fs.readFileSync(__dirname + '/cases/extends_1.expectation.html', 'utf8'),
      p = fixPath(__dirname + '/cases/extends_1.test.html'),
      tmp = fixPath(__dirname + '/../tmp');
    exec('node ' + bin + ' compile ' + p + ' -o ' + tmp + ' --wrap-start="var foo = "', function (err, stdout, stderr) {
      fs.readFile(path.normalize(__dirname + '/../tmp/extends_1.test.html'), 'utf8', function (err, stdout, stderr) {
        var foo;
        eval(stdout);
        expect(swig.run(foo)).to.equal(expectation);
        done();
      });
    });
  });
});

describe('bin/swig compile & run with pre initialize', function () {
  var tmp = fixPath(__dirname + '/../tmp');

  it('works with pre init swig module', function (done) {
    var init = fixPath(__dirname + '/bin.swig-init.js'),
      template = '{% mytag %}hello{% endmytag %}',
      p = tmp + '/init.test.html';
    fs.writeFile(p, template, function () {
      exec('node ' + bin + ' compile ' + p + ' --i ' + init + ' -o ' + tmp, function (err, stdout, stderr) {
        var locals = fixPath(__dirname + '/bin.locals.json');
        exec('node ' + bin + ' run ' + p + ' -j ' + locals, function (err, stdout, stdrr) {
          expect(stdout.replace(/\n$/, '')).to.equal('hello world!');
          done();
        });
      });
    });
  });
});
