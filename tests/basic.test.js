var swig = require('../lib/swig'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

var n = new Swig(),
  oDefaults = n.options;

function resetOptions() {
  swig.setDefaults(oDefaults);
  swig.invalidateCache();
}

describe('options', function () {
  var oDefaults;
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
  });
});

describe('separate instances', function () {
  it('can be created and don\'t interfere', function () {
    var a = new Swig({ varControls: ['<%', '%>'] }),
      b = new Swig();
    expect(a.options.varControls[0]).to.equal('<%');
    expect(b.options.varControls[0]).to.equal('{{');
  });
});
