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

  it('{% raw true %}{{ foo }}{% endraw %}', function () {
    expect(swig.render('{% raw true %}{{ foo }}{% endraw %}'))
      .to.equal('{{ foo }}');
  });

  it('{% raw false %}{{ foo }}{% endraw %}', function () {
    expect(swig.render('{% raw false %}{{ foo }}{% endraw %}', {
      locals: { foo: 'foobar' }
    })).to.equal('foobar');
  });

  it('{% raw bool %}{{ foo }}{% endraw %}', function () {
    expect(swig.render('{% raw true %}{{ foo }}{% endraw %}', {
      locals: { bool: true }
    })).to.equal('{{ foo }}');
  });

  it('{% raw bool %}{{ foo }}{% endraw %}', function () {
    expect(swig.render('{% raw false %}{{ foo }}{% endraw %}', {
      locals: { foo: 'foobar', bool: false }
    })).to.equal('foobar');
  });
});
