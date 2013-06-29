var swig = require('../index.js'),
  expect = require('expect.js'),
  Swig = swig.Swig;

describe('Sanity', function () {
  it('Check', function () {
    expect(swig.render('{{ a }}, {{ b }}', {}, { a: 'apples', b: 'burritos' })).to.equal('apples, burritos');
  });
});

describe('options', function () {
  var oDefaults;
  before(function () {
    var n = new Swig();
    oDefaults = n.options;
  });

  after(function () {
    swig.setDefaults(oDefaults);
  });

  describe('open/close controls', function () {
    it('can be set at compile time', function () {
      expect(swig.compile('<%= a %>', { vars: [ '<%=', '%>' ]})({ a: 'b' })).to.eql('b');
      expect(swig.compile('<* if a *>b<* endif *>', { tags: [ '<*', '*>' ]})({ a: 1 })).to.eql('b');
      expect(swig.compile('<!-- hello -->', { cmts: [ '<!--', '-->' ]})({})).to.eql('');
    });

    it('can be set at render time', function () {
      expect(swig.render('<%= a %>', { vars: [ '<%=', '%>' ]}, { a: 'b' })).to.eql('b');
      expect(swig.render('<^ if a ^>b<^ endif ^>', { tags: [ '<^', '^>' ]}, { a: 1 })).to.eql('b');
      expect(swig.render('<!-- hello -->', { cmts: [ '<!--', '-->' ]}, {})).to.eql('');
    });

    it('can be set as default', function () {
      swig.setDefaults({
        vars: ['<=', '=>'],
        tags: ['<%', '%>'],
        cmts: ['<#', '#>']
      });
      expect(swig.compile('<= a =>')({ a: 'b' })).to.eql('b');
      expect(swig.compile('<% if a %>b<% endif %>')({ a: 1 })).to.eql('b');
      expect(swig.compile('<# hello #>')({})).to.eql('');
    });

    it('must be different', function () {
      expect(function () {
        swig.compile('', { vars: ['**', '**'] })();
      }).to.throwError(/Option \"vars\" open and close controls must not be the same\./);
      expect(function () {
        swig.compile('', { tags: ['**', '**'] })();
      }).to.throwError(/Option \"tags\" open and close controls must not be the same\./);
      expect(function () {
        swig.compile('', { cmts: ['**', '**'] })();
      }).to.throwError(/Option \"cmts\" open and close controls must not be the same\./);
    });

    it('must be at least 2 characters', function () {
      expect(function () {
        swig.compile('', { vars: ['&', '**'] })();
      }).to.throwError('Option "vars" open control must be at least 2 characters. Saw "&" instead.');
      expect(function () {
        swig.compile('', { vars: ['**', '!'] })();
      }).to.throwError('Option "vars" close control must be at least 2 characters. Saw "!" instead.');
      expect(function () {
        swig.compile('', { tags: ['@', '**'] })();
      }).to.throwError('Option "tags" open control must be at least 2 characters. Saw "@" instead.');
      expect(function () {
        swig.compile('', { tags: ['**', '#'] })();
      }).to.throwError('Option "tags" close control must be at least 2 characters. Saw "#" instead.');
      expect(function () {
        swig.compile('', { cmts: ['$', '**'] })();
      }).to.throwError('Option "cmts" open control must be at least 2 characters. Saw "$" instead.');
      expect(function () {
        swig.compile('', { cmts: ['**', '%'] })();
      }).to.throwError('Option "cmts" close control must be at least 2 characters. Saw "%" instead.');
    });
  });
});
