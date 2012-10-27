var swig = require('../../index');

describe('Tag: extends', function () {

  it('throws on circular references', function () {
    swig.init({ allowErrors: true });
    var circular1 = "{% extends 'extends_circular2.html' %}{% block content %}Foobar{% endblock %}",
      circular2 = "{% extends 'extends_circular1.html' %}{% block content %}Barfoo{% endblock %}",
      fn = function () {
        swig.compile(circular1, { filename: 'extends_circular1.html' });
        swig.compile(circular2, { filename: 'extends_circular2.html' })();
      };
    fn.should.throw();
  });

  it('throws if not first tag', function () {
    var fn = function () {
      swig.compile('asdf {% extends foo %}')();
    };
    fn.should.throw();
  });
});
