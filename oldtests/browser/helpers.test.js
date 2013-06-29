
describe('Helpers', function () {
  describe('isLiteral', function () {
    it('"0.1" should be a valid literal', function () {
      expect(helpers.isLiteral('0.1')).to.eql(true);
    });
    it('"foobar" should be a valid literal', function () {
      expect(helpers.isLiteral('"foobar"')).to.eql(true);
    });
    it('\'foobar\' should be a valid literal', function () {
      expect(helpers.isLiteral("'foobar'")).to.eql(true);
    });

    it('".11" should not be a valid literal', function () {
      expect(helpers.isLiteral('.11')).to.eql(false);
    });
    it('"1." should not be a valid literal', function () {
      expect(helpers.isLiteral('1.')).to.eql(false);
    });
    it('"foo" should not be a valid literal', function () {
      expect(helpers.isLiteral('"foo')).to.eql(false);
    });
    it('"foo" should not be a valid literal', function () {
      expect(helpers.isLiteral('foo\'')).to.eql(false);
    });
  });

  describe('isStringLiteral', function () {
    it('"0.1" should be a valid literal', function () {
      expect(helpers.isStringLiteral('"0.1"')).to.eql(true);
    });
    it('"foobar" should be a valid literal', function () {
      expect(helpers.isStringLiteral('"foobar"')).to.eql(true);
    });
    it('\'foobar\' should be a valid literal', function () {
      expect(helpers.isStringLiteral("'foobar'")).to.eql(true);
    });

    it('"1" should not be a valid literal', function () {
      expect(helpers.isStringLiteral('1')).to.eql(false);
    });
    it('".11" should not be a valid literal', function () {
      expect(helpers.isStringLiteral('.11')).to.eql(false);
    });
    it('"1." should not be a valid literal', function () {
      expect(helpers.isStringLiteral('1.')).to.eql(false);
    });
    it('"foo" should not be a valid literal', function () {
      expect(helpers.isStringLiteral('"foo')).to.eql(false);
    });
    it('"foo" should not be a valid literal', function () {
      expect(helpers.isStringLiteral('foo\'')).to.eql(false);
    });
  });

  describe('isValidName', function () {
    it('"foobar" should be a valid name', function () {
      expect(helpers.isValidShortName('foobar')).to.eql(true);
    });
    it('"$foobar" should be a valid name', function () {
      expect(helpers.isValidShortName('$foobar')).to.eql(true);
    });
    it('"_foobar" should be a valid name', function () {
      expect(helpers.isValidShortName('_foobar')).to.eql(true);
    });
    it('"foo$" should be a valid name', function () {
      expect(helpers.isValidShortName('foo$')).to.eql(true);
    });

    it('"0foobar" should not be a valid name', function () {
      expect(helpers.isValidShortName('0foobar')).to.eql(false);
    });
    it('"var" should not be a valid name', function () {
      expect(helpers.isValidShortName('var')).to.eql(false);
    });
    it('"__foo" should not be a valid name', function () {
      expect(helpers.isValidShortName('__foo')).to.eql(false);
    });
  });

  describe('isValidShortName', function () {
    it('"foobar" should be a valid shortname', function () {
      expect(helpers.isValidShortName('foobar')).to.eql(true);
    });
    it('"$foobar" should be a valid shortname', function () {
      expect(helpers.isValidShortName('$foobar')).to.eql(true);
    });
    it('"_foobar" should be a valid shortname', function () {
      expect(helpers.isValidShortName('_foobar')).to.eql(true);
    });
    it('"foo$" should be a valid shortname', function () {
      expect(helpers.isValidShortName('foo$')).to.eql(true);
    });

    it('"0foobar" should not be a valid shortname', function () {
      expect(helpers.isValidShortName('0foobar')).to.eql(false);
    });
    it('"var" should not be a valid shortname', function () {
      expect(helpers.isValidShortName('var')).to.eql(false);
    });
    it('"__foo" should not be a valid shortname', function () {
      expect(helpers.isValidShortName('__foo')).to.eql(false);
    });
  });

  describe('isValidBlockName', function () {
    it('"foobar" should be a valid block name', function () {
      expect(helpers.isValidBlockName('foobar')).to.eql(true);
    });
    it('"foo_bar0" should be a valid block name', function () {
      expect(helpers.isValidBlockName('foo_bar0')).to.eql(true);
    });

    it('"_foobar" should not be a valid block name', function () {
      expect(helpers.isValidBlockName('_foobar')).to.eql(false);
    });
    it('"0foobar" should not be a valid block name', function () {
      expect(helpers.isValidBlockName('0foobar')).to.eql(false);
    });
    it('"foo$" should not be a valid block name', function () {
      expect(helpers.isValidBlockName('foo$')).to.eql(false);
    });
  });

  describe('Setting variables', function () {
    it('does not pull from global/external context', function () {
      var g = (typeof window !== 'undefined') ? window : global;
      g._swigglobaltest = 'asdf';
      expect(swig.compile('{{ _swigglobaltest }}')({ _swigglobaltest: 'fdsa' }))
        .to.equal('fdsa');
      delete g._swigglobaltest;
    });
  });
});
