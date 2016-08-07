var fs = require('fs'),
  exec = require('child_process').exec,
  expect = require('expect.js'),
  _ = require('lodash'),
  path = require('path'),
  swig = require('../../lib/swig'),
  bin = __dirname + '/../../bin/swig.js',
  casedir = __dirname + '/../cases/',
  bindir = __dirname + '/../bin/';

var n = new swig.Swig(),
  oDefaults = n.options,
  tmp;

function resetOptions() {
  swig.setDefaults(oDefaults);
  swig.invalidateCache();
}

function fixPath(p) {
  p = path.normalize(p);
  return (/[A-Z]\:\\/).test(p) ? '"' + p + '"' : p;
}

bin = fixPath(bin);
tmp = fixPath(__dirname + '/../tmp');

function isTest(f) {
  return (/\.test\.html$/).test(f);
}

function isExpectation(f) {
  return (/\.expectation\.html$/).test(f);
}

var casefiles = fs.readdirSync(casedir),
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
  var locals = fixPath(bindir + '/bin.locals.json'),
    key = keys[_.random(keys.length - 1)],
    testcase = cases[key],
    test = fixPath(casedir + _.find(testcase, isTest)),
    expectation = fs.readFileSync(path.normalize(casedir + _.find(testcase, isExpectation)), 'utf8');

  it(key, function (done) {
    exec('node ' + bin + ' render ' + test + ' -j ' + locals, function (err, stdout, stderr) {
      expect(stdout.replace(/\n$/, '')).to.equal(expectation);
      done();
    });
  });
});

describe('bin/swig compile + run', function () {
  var locals = fixPath(bindir + '/bin.locals.json'),
    key = keys[_.random(keys.length - 1)],
    testcase = cases[key],
    test = _.find(testcase, isTest),
    p = fixPath(casedir + test),
    expectation = fs.readFileSync(path.normalize(casedir + _.find(testcase, isExpectation)), 'utf8');

  it(key, function (done) {
    exec('node ' + bin + ' compile ' + p + ' -j ' + locals + ' -o ' + tmp, function (err, stdout, stderr) {
      var p = fixPath(__dirname + '/../tmp/' + test),
        locals = fixPath(bindir + '/bin.locals.js');
      exec('node ' + bin + ' run ' + p + ' -c ' + locals, function (err, stdout, stdrr) {
        expect(stdout.replace(/\n$/, '')).to.equal(expectation);
        done();
      });
    });
  });
});

describe('bin/swig compile -m', function () {
  it('minifies output', function (done) {
    var p = fixPath(casedir + '/extends_1.test.html');
    exec('node ' + bin + ' compile ' + p + ' -m', function (err, stdout, stderr) {
      expect(stdout).to.equal('var tpl=function(n){var e=(n.extensions,"");return e+="Hi,\\n\\n",e+="This is the body.",e+="\\n\\nSincerely,\\nMe\\n"};\n');
      done();
    });
  });
});

describe('bin/swig compile --method-name="foo"', function () {
  it('sets the method name to "foo"', function (done) {
    var p = fixPath(casedir + '/extends_1.test.html');
    exec('node ' + bin + ' compile ' + p + ' --method-name="foo"', function (err, stdout, stderr) {
      expect(stdout).to.equal('var foo = function (_swig,_ctx,_filters,_utils,_fn) {\n  var _ext = _swig.extensions,\n    _output = "";\n_output += "Hi,\\n\\n";\n_output += "This is the body.";\n_output += "\\n\\nSincerely,\\nMe\\n";\n\n  return _output;\n\n};\n');
      done();
    });
  });
});

describe('bin/swig compile & run from swig', function () {
  it('can be run', function (done) {
    var expectation = fs.readFileSync(casedir + '/extends_1.expectation.html', 'utf8'),
      p = fixPath(casedir + '/extends_1.test.html');
    exec('node ' + bin + ' compile ' + p + ' --wrap-start="var foo = "', function (err, stdout, stderr) {
      var foo;
      eval(stdout);
      expect(swig.run(foo)).to.equal(expectation);
      done();
    });
  });
});

describe('bin/swig render with custom extensions', function () {
  var locals = fixPath(bindir + '/bin.locals.json');

  it('works with custom filters', function (done) {
    var filters = fixPath(bindir + '/bin.filters.js'),
      p = fixPath(bindir + '/custom_filter.bin.html');

    exec('node ' + bin + ' render ' + p + ' --filters ' + filters + ' -j ' + locals, function (err, stdout, stderr) {
      expect(stdout).to.equal('I want Nachos please!\n\n');
      done();
    });
  });

  it('works with custom tags', function (done) {
    var tags = fixPath(bindir + '/bin.tags.js'),
      p = fixPath(bindir + '/custom_tag.bin.html');

    exec('node ' + bin + ' render ' + p + ' --tags ' + tags + ' -j ' + locals, function (err, stdout, stderr) {
      expect(stdout).to.equal('flour tortilla!\n\n');
      done();
    });
  });
});

describe('bin/swig custom options', function () {
  var options = fixPath(__dirname + '/options.js'),
    locals = fixPath(bindir + '/bin.locals.json');

  beforeEach(resetOptions);
  afterEach(resetOptions);

  it('change varControls', function (done) {
    var template = fixPath(bindir + '/custom_varControls.bin.html');

    exec('node ' + bin + ' render ' + template + ' --options ' + options + ' -j ' + locals, function (err, stdout, stderr) {
      expect(stdout).to.equal('hello world\n\n');
      done();
    });
  });

  it('change tagControls', function (done) {
    var template = fixPath(bindir + '/custom_tagControls.bin.html');

    exec('node ' + bin + ' render ' + template + ' --options ' + options + ' -j ' + locals, function (err, stdout, stderr) {
      expect(stdout).to.equal('hello world\n\n');
      done();
    });
  });
});
