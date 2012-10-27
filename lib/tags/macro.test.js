var swig = require('../../index');

describe('Tag: macro', function () {
  beforeEach(function () {
    swig.init({ root: __dirname + '/../../tests/templates' });
  });

  it('can be called as a variable once defined', function () {
    swig.compile('{% macro foo %}hi!{% endmacro %}oh, {{ foo }}')()
      .should.equal('oh, hi!');
  });

  it('can accept arguments', function () {
    swig.compile('{% macro foo input %}{{ input }}{% endmacro %}oh, {{ foo("yep") }}')()
      .should.equal('oh, yep');
  });

  it('works very well', function () {
    var tpl = swig.compile([
      '{% macro input type name id label value %}',
      '<label for="{{ name }}">{{ label }}</label>',
      '<input type="{{ type }}" name="{{ name }}" id="{{ id }}" value="{{ value }}">',
      '{% endmacro %}',
      '{{ input( "text", "person", person.id, "Your Name", person.value ) }}'
    ].join(''));
    tpl({ person: { id: 'asdf', name: 'Paul', value : 'val' } })
      .should.equal('<label for="person">Your Name</label><input type="text" name="person" id="asdf" value="val">');
  });
});
