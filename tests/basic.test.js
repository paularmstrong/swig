var swig = require('../index.js'),
  expect = require('expect.js'),
  _ = require('lodash'),
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

    it('must be an array with 2 strings', function () {
      _.each(['vars', 'tags', 'cmts'], function (key) {
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
      _.each(['vars', 'tags', 'cmts'], function (key) {
        var o = {};
        o[key] = ['**', '**'];
        expect(function () {
          swig.compile('', { vars: ['**', '**'] })();
        }).to.throwError('Option "' + key + '" open and close controls must not be the same.');
      });
    });

    it.only('must be at least 2 characters', function () {
      _.each(['vars', 'tags', 'cmts'], function (key) {
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
});
