var testCase = require('nodeunit').testCase,
  swig = require('../../index');

exports.parent = testCase({
  setUp: function (callback) {
    swig.init({
      allowErrors: true
    });
    callback();
  },

  'basic': function (test) {
    swig.compile('{% block foo %}hi{% endblock %}', { filename: 'parent' });
    var tpl = swig.compile('{% extends "parent" %}{% block foo %}{% if true %}{% parent %}{% else %}nope{% endif %}{% endblock %}');
    test.strictEqual(tpl(), 'hi');
    test.done();
  },

  'multiple block parents': function (test) {
    swig.compile('{% block foo %}hi{% endblock %}{% block bar %}bye{% endblock %}', { filename: 'parent' });
    var tpl = swig.compile('{% extends "parent" %}{% block foo %}{% parent %}{% endblock %}{% block bar %}{% parent %}{% endblock %}');
    test.strictEqual(tpl(), 'hibye');
    test.done();
  }
});
