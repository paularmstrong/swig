var helpers = require('./helpers');

describe('Helpers', function () {
  describe('isLiteral', function () {
    it('"0.1" should be a valid literal', function () {
      helpers.isLiteral('0.1').should.eql(true);
    });
    it('"foobar" should be a valid literal', function () {
      helpers.isLiteral('"foobar"').should.eql(true);
    });
    it('\'foobar\' should be a valid literal', function () {
      helpers.isLiteral("'foobar'").should.eql(true);
    });

    it('".11" should not be a valid literal', function () {
      helpers.isLiteral('.11').should.eql(false);
    });
    it('"1." should not be a valid literal', function () {
      helpers.isLiteral('1.').should.eql(false);
    });
    it('"foo" should not be a valid literal', function () {
      helpers.isLiteral('"foo').should.eql(false);
    });
    it('"foo" should not be a valid literal', function () {
      helpers.isLiteral('foo\'').should.eql(false);
    });
  });

  describe('isStringLiteral', function () {
    it('"0.1" should be a valid literal', function () {
      helpers.isStringLiteral('"0.1"').should.eql(true);
    });
    it('"foobar" should be a valid literal', function () {
      helpers.isStringLiteral('"foobar"').should.eql(true);
    });
    it('\'foobar\' should be a valid literal', function () {
      helpers.isStringLiteral("'foobar'").should.eql(true);
    });

    it('"1" should not be a valid literal', function () {
      helpers.isStringLiteral('1').should.eql(false);
    });
    it('".11" should not be a valid literal', function () {
      helpers.isStringLiteral('.11').should.eql(false);
    });
    it('"1." should not be a valid literal', function () {
      helpers.isStringLiteral('1.').should.eql(false);
    });
    it('"foo" should not be a valid literal', function () {
      helpers.isStringLiteral('"foo').should.eql(false);
    });
    it('"foo" should not be a valid literal', function () {
      helpers.isStringLiteral('foo\'').should.eql(false);
    });
  });

  describe('isValidName', function () {
    it('"foobar" should be a valid name', function () {
      helpers.isValidShortName('foobar').should.eql(true);
    });
    it('"$foobar" should be a valid name', function () {
      helpers.isValidShortName('$foobar').should.eql(true);
    });
    it('"_foobar" should be a valid name', function () {
      helpers.isValidShortName('_foobar').should.eql(true);
    });
    it('"foo$" should be a valid name', function () {
      helpers.isValidShortName('foo$').should.eql(true);
    });

    it('"0foobar" should not be a valid name', function () {
      helpers.isValidShortName('0foobar').should.eql(false);
    });
    it('"var" should not be a valid name', function () {
      helpers.isValidShortName('var').should.eql(false);
    });
    it('"__foo" should not be a valid name', function () {
      helpers.isValidShortName('__foo').should.eql(false);
    });
  });

  describe('isValidShortName', function () {
    it('"foobar" should be a valid shortname', function () {
      helpers.isValidShortName('foobar').should.eql(true);
    });
    it('"$foobar" should be a valid shortname', function () {
      helpers.isValidShortName('$foobar').should.eql(true);
    });
    it('"_foobar" should be a valid shortname', function () {
      helpers.isValidShortName('_foobar').should.eql(true);
    });
    it('"foo$" should be a valid shortname', function () {
      helpers.isValidShortName('foo$').should.eql(true);
    });

    it('"0foobar" should not be a valid shortname', function () {
      helpers.isValidShortName('0foobar').should.eql(false);
    });
    it('"var" should not be a valid shortname', function () {
      helpers.isValidShortName('var').should.eql(false);
    });
    it('"__foo" should not be a valid shortname', function () {
      helpers.isValidShortName('__foo').should.eql(false);
    });
  });

  describe('isValidBlockName', function () {
    it('"foobar" should be a valid block name', function () {
      helpers.isValidBlockName('foobar').should.eql(true);
    });
    it('"foo_bar0" should be a valid block name', function () {
      helpers.isValidBlockName('foo_bar0').should.eql(true);
    });

    it('"_foobar" should not be a valid block name', function () {
      helpers.isValidBlockName('_foobar').should.eql(false);
    });
    it('"0foobar" should not be a valid block name', function () {
      helpers.isValidBlockName('0foobar').should.eql(false);
    });
    it('"foo$" should not be a valid block name', function () {
      helpers.isValidBlockName('foo$').should.eql(false);
    });
  });
});
