var expect = require('expect.js'),
  swig = require('../../index');

describe('Tag: macro', function () {
  beforeEach(function () {
    swig.init({ root: __dirname + '/../../tests/templates' });
  });

  it('can be called as a variable once defined', function () {
    expect(swig.compile('{% macro foo %}hi!{% endmacro %}oh, {{ foo }}')())
      .to.equal('oh, hi!');
  });

  it('can accept arguments', function () {
    expect(swig.compile('{% macro foo input %}{{ input }}{% endmacro %}oh, {{ foo("yep") }}')())
      .to.equal('oh, yep');
  });

  it('works very well', function () {
    var tpl = swig.compile([
      '{% macro input type name id label value %}',
      '<label for="{{ name }}">{{ label }}</label>',
      '<input type="{{ type }}" name="{{ name }}" id="{{ id }}" value="{{ value }}">',
      '{% endmacro %}',
      '{{ input( "text", "person", person.id, "Your Name", person.value ) }}'
    ].join(''));
    expect(tpl({ person: { id: 'asdf', name: 'Paul', value : 'val' } }))
      .to.equal('<label for="person">Your Name</label><input type="text" name="person" id="asdf" value="val">');
  });
});
