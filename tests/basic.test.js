var swig = require('../lib/swig'),
  expect = require('expect.js'),
  fs = require('fs'),
  _ = require('lodash'),
  Swig = swig.Swig;

var n = new Swig(),
  oDefaults = n.options;

function resetOptions() {
  swig.setDefaults(oDefaults);
  swig.invalidateCache();
}

describe('version', function () {
  it('is 1.4.2', function () {
    expect(swig.version).to.equal('1.4.2');
  });
});

describe('options', function () {
  beforeEach(resetOptions);
  afterEach(resetOptions);

  describe('open/close controls', function () {
    it('can have new lines inside', function () {
      expect(swig.render('{{\nfoo\n}}', { locals: { foo: 'tacos' }}))
        .to.equal('tacos');
      expect(swig.render('{%\nif foo\n%}tacos{% endif %}', { locals: { foo: 'tacos' }}))
        .to.equal('tacos');
      expect(swig.render('{#\nfoo\n#}'))
        .to.equal('');
    });

    it('can be set at compile time', function () {
      expect(swig.compile('<%= a %>', { varControls: [ '<%=', '%>' ]})({ a: 'b' })).to.eql('b');
      expect(swig.compile('<* if a *>c<* endif *>', { tagControls: [ '<*', '*>' ]})({ a: 1 })).to.eql('c');
      expect(swig.compile('<!-- hello -->', { cmtControls: [ '<!--', '-->' ]})({})).to.eql('');
    });

    it('can be set at render time', function () {
      expect(swig.render('<%= a %>', { varControls: [ '<%=', '%>' ], locals: { a: 'b' }})).to.eql('b');
      expect(swig.render('<^ if a ^>b<^ endif ^>', { tagControls: [ '<^', '^>' ], locals: { a: 1 }})).to.eql('b');
      expect(swig.render('<!-- hello -->', { cmtControls: [ '<!--', '-->' ]})).to.eql('');
    });

    it('can be set as default', function () {
      swig.setDefaults({
        varControls: ['<=', '=>'],
        tagControls: ['<%', '%>'],
        cmtControls: ['<#', '#>']
      });
      expect(swig.compile('<= a =>')({ a: 'b' })).to.eql('b');
      expect(swig.compile('<% if a %>b<% endif %>')({ a: 1 })).to.eql('b');
      expect(swig.compile('<# hello #>')({})).to.eql('');
    });

    it('must be an array with 2 strings', function () {
      _.each(['varControls', 'tagControls', 'cmtControls'], function (key) {
        expect(function () {
          var o = {};
          o[key] = 'ab';
          swig.compile('', o)();
        }).to.throwError('Option "' + key + '" must be an array containing 2 different control strings.');
        expect(function () {
          var o = {};
          o[key] = ['a'];
          swig.compile('', o)();
        }).to.throwError('Option "' + key + '" must be an array containing 2 different control strings.');
      });
    });

    it('must be different', function () {
      _.each(['varControls', 'tagControls', 'cmtControls'], function (key) {
        var o = {};
        o[key] = ['**', '**'];
        expect(function () {
          swig.compile('', o)();
        }).to.throwError('Option "' + key + '" open and close controls must not be the same.');
      });
    });

    it('must be at least 2 characters', function () {
      _.each(['varControls', 'tagControls', 'cmtControls'], function (key) {
        expect(function () {
          var o = {};
          o[key] = ['&', '**'];
          swig.compile('', o)();
        }).to.throwError('Option "' + key + '" open control must be at least 2 characters. Saw "&" instead.');
        expect(function () {
          var o = {};
          o[key] = ['**', '!'];
          swig.compile('', o)();
        }).to.throwError('Option "' + key + '" close control must be at least 2 characters. Saw "!" instead.');
      });
    });
  });

  describe('locals', function () {
    it('can be set as defaults', function () {
      swig.setDefaults({ locals: { a: 1, b: 2 }});
      var tpl = '{{ a }}{{ b }}{{ c }}';
      expect(swig.compile(tpl)({ c: 3 })).to.equal('123');
      expect(swig.compile(tpl, { locals: { c: 3 }})()).to.equal('123');
      expect(swig.render(tpl, { locals: { c: 3 }})).to.equal('123');
    });

    it('use local-context first for output', function () {
      var tpl = '{{ foo }}';
      expect(swig.render(tpl, { locals: { foo: 'bar' }})).to.equal('bar');
      global.foo = 'foo';
      expect(swig.render(tpl, { locals: {}})).to.equal('foo');
      delete global.foo;
      expect(swig.render(tpl, { locals: {}})).to.equal('');
    });
  });

  describe('cache', function () {
    it('can be falsy', function () {
      var s = new Swig({ cache: false });
      s.compile('a', { filename: 'a' })();
      expect(s.cache).to.eql({});

      s.options.cache = null;
      s.compile('a', { filename: 'a' })();
      expect(s.cache).to.eql({});
    });

    it('can be "memory" and is by default', function () {
      var s = new Swig();
      s.compile('a', { filename: 'a' });
      expect(s.cache.a).to.be.a(Function);

      s.compile('b', { cache: 'memory', filename: 'b' });
      expect(s.cache.b).to.be.a(Function);
      // hit the cache to ensure it works
      s.compile('b', { cache: 'memory', filename: 'b' });
    });

    it('can accept custom "get" and "set" methods', function () {
      var c = {};
      swig.setDefaults({ cache: {
        get: function (key) {
          return c[key];
        },
        set: function (key, val) {
          c[key] = val;
        }
      }});

      swig.compile('a', { filename: 'a' });
      expect(c.a).to.be.a(Function);
    });

    it('throws on anything else', function () {
      expect(function () { var s = new Swig({ cache: 'dookie' }); })
        .to.throwError();

      expect(function () { swig.setDefaults({ cache: { a: 1, b: 2 } }); })
        .to.throwError();
    });

    it('gh-423: compile method respects local cache setting', function () {
      var s = new Swig();
      s.compile('a', { filename: 'a', cache: false });
      expect(s.cache).to.not.have.property('a');
    });
  });

  describe('null object', function () {
    it('can skip null object', function () {
      expect(swig.render('{{ a.property }}', { locals: { a: null }})).to.equal('');
    });
  });

});

describe('separate instances', function () {
  it('can be created and don\'t interfere', function () {
    var a = new Swig({ varControls: ['<%', '%>'] }),
      b = new Swig();
    expect(a.options.varControls[0]).to.equal('<%');
    expect(b.options.varControls[0]).to.equal('{{');
  });

  it('properly autoescapes', function () {
    var a = new Swig({ autoescape: false }),
      b = new Swig();
    expect(swig.render('{{ foo }}', { locals: { foo: '<h1>' }})).to.equal('&lt;h1&gt;');
    expect(a.render('{{ foo }}', { locals: { foo: '<h1>' }})).to.equal('<h1>');
    expect(b.render('{{ foo }}', { locals: { foo: '<h1>' }})).to.equal('&lt;h1&gt;');
  });
});

describe('swig.compileFile', function () {
  // The following tests should *not* run in the browser
  if (!fs || !fs.readFileSync) {
    return;
  }
  var test = __dirname + '/cases/extends_1.test.html';

  beforeEach(resetOptions);
  afterEach(resetOptions);

  it('can run syncronously', function () {
    expect(swig.compileFile(test)())
      .to.be.ok();
  });

  it('can run asynchronously', function (done) {
    // Run twice to ensure cached result uses the callback [gh-291]
    swig.compileFile(test, {}, function (err, fn) {
      expect(fn).to.be.a(Function);
      expect(swig.compileFile(test, {}, function (err, fn) {
        expect(fn).to.be.a(Function);
        done();
      }));
    });
  });

  it('can use callback with errors', function (done) {
    var errorTest = __dirname + '/cases-error/extends-non-existent.test.html';
    expect(swig.compileFile(errorTest, {}, function (err) {
      expect(err.code).to.equal('ENOENT');
      done();
    }));
  });
});

describe('swig.renderFile', function () {
  var test, expectation;

  it('can use callback with errors occurred at the time of rendering', function (done) {
    var s = new swig.Swig({ loader: swig.loaders.memory({ 'error.html': '{{ foo() }}' }) });

    s.renderFile('error.html', { foo: function () { throw new Error('bunk'); } }, function (err, out) {
      expect(err.message).to.equal('bunk');
      done();
    });
  });

  // The following tests should *not* run in the browser
  if (!fs || !fs.readFileSync) {
    return;
  }
  test = __dirname + '/cases/extends_1.test.html';
  expectation = fs.readFileSync(test.replace('test.html', 'expectation.html'), 'utf8');

  beforeEach(resetOptions);
  afterEach(resetOptions);

  it('can run syncronously', function () {
    expect(swig.renderFile(test))
      .to.equal(expectation);
  });

  it('can run asynchronously', function (done) {
    expect(swig.renderFile(test, {}, function (err, fn) {
      expect(fn).to.equal(expectation);
      done();
    }));
  });

  it('can use callbacks with errors', function (done) {
    swig.renderFile(__dirname + '/cases/not-existing', {}, function (err, out) {
      expect(err.code).to.equal('ENOENT');
      done();
    });
  });

});

describe('swig.run', function () {
  var tpl;

  beforeEach(function () {
    tpl = swig.precompile('Hello {{ foobar }}').tpl;
  });

  it('runs compiled templates', function () {
    expect(swig.run(tpl)).to.equal('Hello ');
    expect(swig.run(tpl, { foobar: 'Tacos'})).to.equal('Hello Tacos');
  });

  it('does not cache if no filename given', function () {
    var nSwig = new Swig();
    nSwig.run(tpl, { foobar: 'Tacos'});
    expect(Object.keys(nSwig.cache).length).to.equal(0);
  });

  it('caches if given a filename', function () {
    var nSwig = new Swig();
    nSwig.run(tpl, { foobar: 'Tacos'}, 'foo');
    expect(Object.keys(nSwig.cache).length).to.equal(1);
  });
});
