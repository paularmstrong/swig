var swig = require('../../lib/swig'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

var cases = [
  { c: '{% spaceless %} <p> foo </p> <p>bar</p> {% endspaceless %}', e: '<p> foo </p><p>bar</p>' },
  { c: '{% spaceless %}{% if true %}<p></p> <p></p>{% endif %}{% endspaceless %}', e: '<p></p><p></p>' },
  { c: '{% spaceless %}{% if false %}{% else %}<p></p> <p></p>{% endif %}{% endspaceless %}', e: '<p></p><p></p>' },
  { c: '{% spaceless %}{% macro foo %}<p></p> <p></p>{% endmacro %}{% endspaceless %}{{ foo() }}', e: '<p></p> <p></p>' },
  { c: '{% macro foo %}<p></p> <p></p>{% endmacro %}{% spaceless %}{{ foo() }}{% endspaceless %}', e: '<p></p><p></p>' }
];

describe('Tag: spaceless', function () {
  _.each(cases, function (c) {
    it(c.c, function () {
      expect(swig.render(c.c)).to.equal(c.e);
    });
  });

  it('Throws on tokens', function () {
    expect(function () {
      swig.render('{% spaceless foobar %}{% endfilter %}');
    }).to.throwError(/Unexpected token \"foobar\" on line 1\./);
  });
});
