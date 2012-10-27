var testCase = require('nodeunit').testCase,
  swig = require('../../index');

exports.raw = testCase({
  setUp: function (callback) {
    swig.init({ allowErrors: true });
    callback();
  },

  basic: function (test) {
    var input = '{{ foo }} {% set bar = "foo" %}{% if foo %}blah: {{ foo }} {% block foobar %}{{ foo }}{% endblock %}{% endif %}',
      tpl = swig.compile('{%raw%}' + input + '{% endraw %}');
    test.strictEqual(tpl({ foo: 'foo' }), input);
    test.done();
  },

  'new lines': function (test) {
    var input = '\n{{ foo }}\n',
      tpl = swig.compile('{% raw %}' + input + '{% endraw %}');
    test.strictEqual(tpl({}), input);
    test.done();
  },

  'non-conforming': function (test) {
    var input = '{{ foo bar %} {% {#',
      tpl = swig.compile('{% raw %}' + input + '{% endraw %}');

    test.strictEqual(tpl({}), input);
    test.done();
  },

  'errors when no endraw tag found': function (test) {
    test.throws(function () {
      swig.compile('{% raw %}{{ foobar }}');
    }, Error);
    test.done();
  }
});
