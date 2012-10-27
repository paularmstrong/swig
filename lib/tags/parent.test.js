var swig = require('../../index');

describe('Tag: parent', function () {
  beforeEach(function () {
    swig.init({ allowErrors: true });
  });

  it('prints the contents from the parent template block of the same name', function () {
    swig.compile('{% block foo %}hi{% endblock %}', { filename: 'parent' });
    swig.compile('{% extends "parent" %}{% block foo %}{% if true %}{% parent %}{% else %}nope{% endif %}{% endblock %}')()
      .should.equal('hi');
  });

  it('references the correct block', function () {
    swig.compile('{% block foo %}hi{% endblock %}{% block bar %}bye{% endblock %}', { filename: 'parent' });
    swig.compile('{% extends "parent" %}{% block foo %}{% parent %}{% endblock %}{% block bar %}{% parent %}{% endblock %}')()
      .should.equal('hibye');
  });

});
