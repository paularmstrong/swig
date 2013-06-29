
describe('Tag: parent', function () {
  beforeEach(function () {
    swig.init({ allowErrors: true });
  });

  it('prints the contents from the parent template block of the same name', function () {
    swig.compile('{% block foo %}hi{% endblock %}', { filename: 'parent' });
    expect(swig.compile('{% extends "parent" %}{% block foo %}{% if true %}{% parent %}{% else %}nope{% endif %}{% endblock %}')())
      .to.equal('hi');
  });

  it('references the correct block', function () {
    swig.compile('{% block foo %}hi{% endblock %}{% block bar %}bye{% endblock %}', { filename: 'parent' });
    expect(swig.compile('{% extends "parent" %}{% block foo %}{% parent %}{% endblock %}{% block bar %}{% parent %}{% endblock %}')())
      .to.equal('hibye');
  });

});
