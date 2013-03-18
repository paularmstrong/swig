var require = require('../testutils').require,
  expect = require('expect.js'),
  swig = require('../../lib/swig');

describe('Tag: iterate', function () {
  beforeEach(function () {
    swig.init({ allowErrors: true });
  });

  // it('simple test', function () {
  //   var iterate_tmpl = [
  //     '{% iterate item 1 to 3 %}',
  //     '<li>{{item}}</li>',
  //     '{% enditerate %}'
  //   ].join('\n'),

  //   tpl = swig.compile(iterate_tmpl);

  //   expect(tpl({})).to.equal('<li>1</li><li>2</li><li>3</li>');

  // });
});