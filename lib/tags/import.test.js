var expect = require('expect.js'),
  swig = require('../../index');

describe('Tag: import (for macros)', function () {
  beforeEach(function () {
    swig.init({ root: __dirname + '/../../tests/templates' });
    if (typeof window !== 'undefined') {
      swig.compile('{% macro foo %}\nhi!\n{% endmacro %}\n\n{% macro bar baz %}\n{% if baz %}\nbye!\n{% else %}\nfudge.\n{% endif %}\n{% endmacro %}', { filename: 'macros.html' });
    }
  });

  it('imports macros', function () {
    var tpl = swig.compile('{% import "macros.html" as blah %}{{ blah.foo }}, {{ blah.bar("baz") }}');
    expect(tpl({})).to.equal('\nhi!\n, \n\nbye!\n\n');
  });

  it('importing as context does not override base context', function () {
    var tpl = swig.compile('{% import "macros.html" as blah %}{{ foo }}');
    expect(tpl({})).to.equal('');
  });

  it('includes imports from parent templates', function () {
    swig.compile('{% macro foo input %}hey, {{ input }}{% endmacro %}', { filename: 'blarbar.html' });
    swig.compile('{% import "blarbar.html" as mahmacros %} foobar {% block content %}{% endblock %}', { filename: 'parent.html' });
    expect(swig.compile('{% extends "parent.html" %} {% block content %}{{ mahmacros.foo("bar") }}{% endblock %}')()
      ).to.equal(' foobar hey, bar');
  });

});
