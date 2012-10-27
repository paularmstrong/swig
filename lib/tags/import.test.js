var swig = require('../../index');

describe('Tag: import (for macros)', function () {
  beforeEach(function () {
    swig.init({ root: __dirname + '/../../tests/templates' });
    if (typeof window !== 'undefined') {
      swig.compile('{% macro foo %}\nhi!\n{% endmacro %}\n\n{% macro bar baz %}\n{% if baz %}\nbye!\n{% else %}\nfudge.\n{% endif %}\n{% endmacro %}', { filename: 'macros.html' });
    }
  });

  it('imports macros', function () {
    var tpl = swig.compile('{% import "macros.html" as blah %}{{ blah.foo }}, {{ blah.bar("baz") }}');
    tpl({}).should.equal('\nhi!\n, \n\nbye!\n\n');
  });

  it('importing as context does not override base context', function () {
    var tpl = swig.compile('{% import "macros.html" as blah %}{{ foo }}');
    tpl({}).should.equal('');
  });

  it('includes imports from parent templates', function () {
    swig.compile('{% macro foo input %}hey, {{ input }}{% endmacro %}', { filename: 'blarbar.html' });
    swig.compile('{% import "blarbar.html" as mahmacros %} foobar {% block content %}{% endblock %}', { filename: 'parent.html' });
    swig.compile('{% extends "parent.html" %} {% block content %}{{ mahmacros.foo("bar") }}{% endblock %}')()
      .should.equal(' foobar hey, bar');
  });

});
