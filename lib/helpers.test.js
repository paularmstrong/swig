var helpers = require('./helpers');

exports.isLiteral = function (test) {
    test.ok(helpers.isLiteral('0.1'), '"0.1" should be a valid literal');
    test.ok(helpers.isLiteral('"foobar"'), '"foobar" should be a valid literal');
    test.ok(helpers.isLiteral("'foobar'"), '\'foobar\' should be a valid literal');

    test.ok(!helpers.isLiteral('.11'), '".11" should not be a valid literal');
    test.ok(!helpers.isLiteral('1.'), '"1." should not be a valid literal');
    test.ok(!helpers.isLiteral('"foo'), '"foo" should not be a valid literal');
    test.ok(!helpers.isLiteral('foo\''), '"foo" should not be a valid literal');
    test.done();
};

exports.isStringLiteral = function (test) {
    test.ok(helpers.isStringLiteral('"0.1"'), '"0.1" should be a valid literal');
    test.ok(helpers.isStringLiteral('"foobar"'), '"foobar" should be a valid literal');
    test.ok(helpers.isStringLiteral("'foobar'"), '\'foobar\' should be a valid literal');

    test.ok(!helpers.isStringLiteral('1'), '"1" should not be a valid literal');
    test.ok(!helpers.isStringLiteral('.11'), '".11" should not be a valid literal');
    test.ok(!helpers.isStringLiteral('1.'), '"1." should not be a valid literal');
    test.ok(!helpers.isStringLiteral('"foo'), '"foo" should not be a valid literal');
    test.ok(!helpers.isStringLiteral('foo\''), '"foo" should not be a valid literal');
    test.done();
};

exports.isValidName = function (test) {
    test.ok(helpers.isValidShortName('foobar'), '"foobar" should be a valid name');
    test.ok(helpers.isValidShortName('$foobar'), '"$foobar" should be a valid name');
    test.ok(helpers.isValidShortName('_foobar'), '"_foobar" should be a valid name');
    test.ok(helpers.isValidShortName('foo$'), '"foo$" should be a valid name');

    test.ok(!helpers.isValidShortName('0foobar'), '"0foobar" should not be a valid name');
    test.ok(!helpers.isValidShortName('var'), '"var" should not be a valid name');
    test.ok(!helpers.isValidShortName('__foo'), '"__foo" should not be a valid name');
    test.done();
};

exports.isValidShortName = function (test) {
    test.ok(helpers.isValidShortName('foobar'), '"foobar" should be a valid shortname');
    test.ok(helpers.isValidShortName('$foobar'), '"$foobar" should be a valid shortname');
    test.ok(helpers.isValidShortName('_foobar'), '"_foobar" should be a valid shortname');
    test.ok(helpers.isValidShortName('foo$'), '"foo$" should be a valid shortname');

    test.ok(!helpers.isValidShortName('0foobar'), '"0foobar" should not be a valid shortname');
    test.ok(!helpers.isValidShortName('var'), '"var" should not be a valid shortname');
    test.ok(!helpers.isValidShortName('__foo'), '"__foo" should not be a valid shortname');
    test.done();
};

exports.isValidBlockName = function (test) {
    test.ok(helpers.isValidBlockName('foobar'), '"foobar" should be a valid block name');
    test.ok(helpers.isValidBlockName('foo_bar0'), '"foo_bar0" should be a valid block name');

    test.ok(!helpers.isValidBlockName('_foobar'), '"_foobar" should not be a valid block name');
    test.ok(!helpers.isValidBlockName('0foobar'), '"0foobar" should not be a valid block name');
    test.ok(!helpers.isValidBlockName('foo$'), '"foo$" should not be a valid block name');

    test.done();
};
