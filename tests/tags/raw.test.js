var swig = require('../../lib/swig'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

describe('Tag: raw', function () {

  it('{% raw %}{{ foo }}{% endraw %}', function () {
    expect(swig.render('{% raw %}{{ foo }}{% endraw %}'))
      .to.equal('{{ foo }}');
  });

  it('{% raw %}{% foo %}{% endraw %}', function () {
    expect(swig.render('{% raw %}{% foo %}{% endraw %}'))
      .to.equal('{% foo %}');
  });

  it('{% raw %}\n{% if true %}\nstuff\n{% endif %}\n{% endraw %}', function () {
    expect(swig.render('{% raw %}\n{% if true %}\nstuff\n{% endif %}\n{% endraw %}'))
      .to.equal('\n{% if true %}\nstuff\n{% endif %}\n');
  });

  it('{% raw %}{# foo #}{% endraw %}', function () {
    expect(swig.render('{% raw %}{# foo #}{% endraw %}'))
      .to.equal('{# foo #}');
  });

  it('does not accept arguments', function () {
    expect(function () {
      swig.render('{% raw foobar %}foo{% endraw %}');
    }).to.throwError(/Unexpected token "foobar" in raw tag on line 1\./);
  });
});
