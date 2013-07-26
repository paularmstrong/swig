var swig = require('../../index.js'),
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

  it('{% raw %}{# foo #}{% endraw %}', function () {
    expect(swig.render('{% raw %}{# foo #}{% endraw %}'))
      .to.equal('{# foo #}');
  });

});
