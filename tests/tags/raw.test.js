var require = require('../testutils').require,
  expect = require('expect.js'),
  swig = require('../lib/swig');

describe('Tag: raw', function () {
  beforeEach(function () {
    swig.init({ allowErrors: true });
  });

  it('outputs unparsed content', function () {
    var input = '{{ foo }} {% set bar = "foo" %}{% if foo %}blah: {{ foo }} {% block foobar %}{{ foo }}{% endblock %}{% endif %}';
    expect(swig.compile('{%raw%}' + input + '{% endraw %}')({ foo: 'foo' }))
      .to.equal(input);
  });

  it('respects newlines', function () {
    var input = '\n{{ foo }}\n';
    expect(swig.compile('{% raw %}' + input + '{% endraw %}')())
      .to.equal(input);
  });

  it('does not care about non-conforming swig syntax inside', function () {
    var input = '{{ foo bar %} {% {#';
    expect(swig.compile('{% raw %}' + input + '{% endraw %}')())
      .to.equal(input);
  });

  it('throws when no endraw tag found', function () {
    var fn = function () {
      swig.compile('{% raw %}{{ foobar }}');
    };
    expect(fn).to.throwException();
  });
});
