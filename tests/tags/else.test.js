var swig = require('../../lib/swig'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;


var cases = [
  { code: 'true',  result: false },
  { code: 'false', result: true }
];

describe('Tag: else', function () {

  _.each(cases, function (c) {
    it('{% if ' + c.code + ' %}{% else %}', function () {
      expect(swig.render('{% if ' + c.code + ' %}{% else %}pass{% endif %}'))
        .to.equal(c.result ? 'pass' : '');
    });
  });

  it('must be within an {% if %}', function () {
    expect(function () {
      swig.render('{% else %}foo');
    }).to.throwError(/Unexpected tag "else" on line 1\./);
  });

  it('does not accept conditionals/args (use elseif, elif)', function () {
    expect(function () {
      swig.render('{% if foo %}{% else what %}{% endif %}');
    }).to.throwError(/"else" tag does not accept any tokens. Found "what" on line 1\./);
  });
});

describe('Tag: elseif, elif', function () {

  _.each(cases, function (c) {
    it('{% if ' + (!c.code) + ' %}{% elseif ' + c.code + ' %}', function () {
      expect(swig.render('{% if ' + (!c.code) + ' %}{% elseif ' + c.code + ' %}pass{% endif %}'))
        .to.equal(!c.result ? 'pass' : '');
      expect(swig.render('{% if ' + (!c.code) + ' %}{% elif ' + c.code + ' %}pass{% endif %}'))
        .to.equal(!c.result ? 'pass' : '');
    });
  });

  it('{% if false %}{% elseif foo > 1 %}', function () {
    expect(swig.render('{% if false %}{% elseif foo > 1 %}pass{% endif %}', { locals: { foo: 5 }}))
      .to.equal('pass');
  });

  it('must be within an {% if %}', function () {
    expect(function () {
      swig.render('{% elseif true %}foo');
    }).to.throwError(/Unexpected tag "elseif" on line 1\./);
  });

  it('requires a conditional', function () {
    expect(function () {
      swig.render('{% if true %}{% elif %}foo');
    }).to.throwError(/No conditional statement provided on line 1\./);
  });
});
