var swig = require('../../index');

describe('Tag: autoescape', function () {
  beforeEach(function () {
    swig.init({});
  });

  describe('arguments', function () {
    it('true - escapes', function () {
      var tpl = swig.compile('{% autoescape true %}{{ foo }}{% endautoescape %}');
      tpl({ foo: '<\'single\' & "double" quotes>' }).should.equal('&lt;&#39;single&#39; &amp; &quot;double&quot; quotes&gt;');
    });

    it('false - does not escape', function () {
      var tpl = swig.compile('{% autoescape false %}{{ foo }}{% endautoescape %}');
      tpl({ foo: '<\'single\' & "double" quotes>' }).should.equal('<\'single\' & "double" quotes>');
    });

    it('"js" - escapes as javascript', function () {
      var tpl = swig.compile('{% autoescape true "js" %}{{ foo }}{% endautoescape %}');
      tpl({ foo: '"double quotes" and \'single quotes\'' }).should.equal('\\u0022double quotes\\u0022 and \\u0027single quotes\\u0027');
      tpl({ foo: '<script>and this</script>' }).should.equal('\\u003Cscript\\u003Eand this\\u003C/script\\u003E');
      tpl({ foo: '\\ : backslashes, too' }).should.equal('\\u005C : backslashes, too');
      tpl({ foo: 'and lots of whitespace: \r\n\t\v\f\b' }).should.equal('and lots of whitespace: \\u000D\\u000A\\u0009\\u000B\\u000C\\u0008');
      tpl({ foo: 'and "special" chars = -1;' }).should.equal('and \\u0022special\\u0022 chars \\u003D \\u002D1\\u003B');
    });
  });

  it('resets after endautoescape', function () {
    var tpl = swig.compile('{% autoescape false %}{% endautoescape %}{{ foo }}');
    tpl({ foo: '<\'single\' & "double" quotes>' }).should.equal('&lt;&#39;single&#39; &amp; &quot;double&quot; quotes&gt;');
  });
});
