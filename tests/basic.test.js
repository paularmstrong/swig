var swig = require('../index.js'),
  expect = require('expect.js'),
  Swig = swig.Swig;

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
    it.only('can be set at compile time', function () {
      expect(swig.compile('<%= a %>', { vars: [ '<%=', '%>' ]})({ a: 'b' })).to.eql('b');
      expect(swig.compile('^^ if a ^^b^^ endif ^^', { tags: [ '^^', '^^' ]})({ a: 1 })).to.eql('b');
      expect(swig.compile('<!-- hello -->', { cmts: [ '<!--', '-->' ]})({})).to.eql('');
    });

    it('can be set at render time', function () {
      expect(swig.render('<%= a %>', { vars: [ '<%=', '%>' ]}, { a: 'b' })).to.eql('b');
      expect(swig.render('^^ if a ^^b^^ endif ^^', { tags: [ '^^', '^^' ]}, { a: 1 })).to.eql('b');
      expect(swig.render('<!-- hello -->', { cmts: [ '<!--', '-->' ]}, {})).to.eql('');
    });

    it('can be set as default', function () {
      swig.setDefaults({
        vars: ['==', '=='],
        tags: ['%%', '%%'],
        cmts: ['##', '##']
      });
      expect(swig.compile('== a ==')({ a: 'b' })).to.eql('b');
      expect(swig.compile('%% if a %%b%% endif %%')({ a: 1 })).to.eql('b');
      expect(swig.compile('## hello ##')({})).to.eql('');
    });
  });
});
