var swig = require('../../index');

describe('Tag: raw', function () {
  beforeEach(function () {
    swig.init({ allowErrors: true });
  });

  it('outputs unparsed content', function () {
    var input = '{{ foo }} {% set bar = "foo" %}{% if foo %}blah: {{ foo }} {% block foobar %}{{ foo }}{% endblock %}{% endif %}';
    swig.compile('{%raw%}' + input + '{% endraw %}')({ foo: 'foo' })
      .should.equal(input);
  });

  it('respects newlines', function () {
    var input = '\n{{ foo }}\n';
    swig.compile('{% raw %}' + input + '{% endraw %}')()
      .should.equal(input);
  });

  it('does not care about non-conforming swig syntax inside', function () {
    var input = '{{ foo bar %} {% {#';
    swig.compile('{% raw %}' + input + '{% endraw %}')()
      .should.equal(input);
  });

  it('throws when no endraw tag found', function () {
    var fn = function () {
      swig.compile('{% raw %}{{ foobar }}');
    };
    fn.should.throw();
  });
});
