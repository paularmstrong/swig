var expect = require('expect.js'),
  swig = require('../../../lib/swig');

describe('Tag: spaceless', function () {
  beforeEach(function () {
    swig.init({ allowErrors: true });
  });

  it('removes leading white-space', function () {
    var spaceless_tmpl = [
        '{% spaceless %}',
        ' ',
        '',
        '<li>1</li>',
        '{% endspaceless %}'
      ].join('\n'),

      tpl = swig.compile(spaceless_tmpl);

    expect(tpl({})).to.equal('<li>1</li>');

  });

  it('removes white-spaces betwen tags', function () {
    var spaceless_tmpl = [
        '{% spaceless %}',
        '<li>1</li>',
        ' <li>2</li>',
        '<li>3',
        '</li>',
        '<li>4',
        ' </li>',
        '<li id="5">',
        '   </li>',

        '{% endspaceless %}',
      ].join('\n'),

      tpl = swig.compile(spaceless_tmpl);

    expect(tpl({})).to.equal('<li>1</li><li>2</li><li>3\n</li><li>4\n </li><li id="5"></li>');

  });

  it('removes trailing white-space', function () {
    var spaceless_tmpl = [
        '{% spaceless %}',
        '<li>1</li>',
        '',
        '  ',
        '{% endspaceless %}'
      ].join('\n'),

      tpl = swig.compile(spaceless_tmpl);

    expect(tpl({})).to.equal('<li>1</li>');

  });
});
