var expect = require('expect.js'),
  swig = require('../../../lib/swig');

describe('Tag: autoescape', function () {
  beforeEach(function () {
    swig.init({});
  });

  describe('arguments', function () {
    it('true - escapes', function () {
      var tpl = swig.compile('{% autoescape true %}{{ foo }}{% endautoescape %}');
      expect(tpl({ foo: '<\'single\' & "double" quotes>' }))
        .to.equal('&lt;&#39;single&#39; &amp; &quot;double&quot; quotes&gt;');
    });

    it('false - does not escape', function () {
      var tpl = swig.compile('{% autoescape false %}{{ foo }}{% endautoescape %}');
      expect(tpl({ foo: '<\'single\' & "double" quotes>' }))
        .to.equal('<\'single\' & "double" quotes>');
    });

    it('"js" - escapes as javascript', function () {
      var tpl = swig.compile('{% autoescape true "js" %}{{ foo }}{% endautoescape %}');
      expect(tpl({ foo: '"double quotes" and \'single quotes\'' }))
        .to.equal('\\u0022double quotes\\u0022 and \\u0027single quotes\\u0027');
      expect(tpl({ foo: '<script>and this</script>' }))
        .to.equal('\\u003Cscript\\u003Eand this\\u003C/script\\u003E');
      expect(tpl({ foo: '\\ : backslashes, too' }))
        .to.equal('\\u005C : backslashes, too');
      expect(tpl({ foo: 'and lots of whitespace: \r\n\t\v\f\b' }))
        .to.equal('and lots of whitespace: \\u000D\\u000A\\u0009\\u000B\\u000C\\u0008');
      expect(tpl({ foo: 'and "special" chars = -1;' }))
        .to.equal('and \\u0022special\\u0022 chars \\u003D \\u002D1\\u003B');
    });
  });

  it('resets after endautoescape', function () {
    var tpl = swig.compile('{% autoescape false %}{% endautoescape %}{{ foo }}');
    expect(tpl({ foo: '<\'single\' & "double" quotes>' }))
      .to.equal('&lt;&#39;single&#39; &amp; &quot;double&quot; quotes&gt;');
  });
});
