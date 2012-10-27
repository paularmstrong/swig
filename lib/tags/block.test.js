var swig = require('../../index');

describe('Tag: block', function () {
  beforeEach(function () {
    swig.init({
      allowErrors: true
    });
  });

  it('basic', function () {
    var tpl,
      extends_base = [
        'This is from the "extends_base.html" template.',
        '',
        '{% block one %}',
        '  This is the default content in block \'one\'',
        '{% endblock %}',
        '',
        '{% block two %}',
        '  This is the default content in block \'two\'',
        '{% endblock %}'
      ].join('\n'),
      extends1 = [
        '{% extends "extends_base.html" %}',
        'This is content from "extends_1.html", you should not see it',
        '',
        '{% block one %}',
        '  This is the "extends_1.html" content in block \'one\'',
        '{% endblock %}'
      ].join('\n');

    swig.compile(extends_base, { filename: 'extends_base.html' });
    tpl = swig.compile(extends1, { filename: 'extends1.html' });
    tpl({}).should.equal('This is from the "extends_base.html" template.\n\n\n  This is the "extends_1.html" content in block \'one\'\n\n\n  This is the default content in block \'two\'\n');
  });

  it('can chain extends', function () {
    var tpl,
      extends_base = [
        'This is from the "extends_base.html" template.',
        '',
        '{% block one %}',
        '  This is the default content in block \'one\'',
        '{% endblock %}',
        '',
        '{% block two %}',
        '  This is the default content in block \'two\'',
        '{% endblock %}'
      ].join('\n'),
      extends1 = [
        '{% extends "extends_base.html" %}',
        'This is content from "extends_1.html", you should not see it',
        '',
        '{% block one %}',
        '  This is the "extends_1.html" content in block \'one\'',
        '{% endblock %}'
      ].join('\n'),
      extends2 = [
        '{% extends "extends1.html" %}',
        'This is content from "extends_2.html", you should not see it',
        '',
        '{% block one %}',
        '  This is the "extends_2.html" content in block \'one\'',
        '{% endblock %}'
      ].join('\n');

    swig.compile(extends_base, { filename: 'extends_base.html' });
    swig.compile(extends1, { filename: 'extends1.html' });
    tpl = swig.compile(extends2, { filename: 'extends2.html' });
    tpl({}).should.equal('This is from the "extends_base.html" template.\n\n\n  This is the "extends_2.html" content in block \'one\'\n\n\n  This is the default content in block \'two\'\n');
  });

  describe('nesting', function () {
    it('is allowed', function () {
      var tpl,
        extends_base = [
          'Base Content 1',
          '',
          '{% block one %}',
          'OneContent 1',
          '{% block onetwo %}',
          'OneTwoContent',
          '{% endblock %}',
          'OneContent 2',
          '{% endblock %}',
          '',
          '{% block two %}',
          'Base Content 2',
          '{% endblock %}',
        ].join('\n'),
        extends1 = [
          '{% extends "extends_base.html" %}',
          '',
          '{% block onetwo %}',
          'DerivedContent',
          '{% endblock %}'
        ].join('\n');

      swig.compile(extends_base, { filename: 'extends_base.html' });
      tpl = swig.compile(extends1, { filename: 'extends1.html' });
      tpl({}).should.equal('Base Content 1\n\n\nOneContent 1\n\nDerivedContent\n\nOneContent 2\n\n\nBase Content 2\n');
    });
    it('can be multi-level', function () {

      var tpl,
        extends_base = [
          'Base Content 1',
          '',
          '{% block one %}',
          'OneContent 1',
          '{% block onetwo %}',
          'OneTwoContent 1',
          '{% block onetwothree %}',
          'OneTwoThreeContent',
          '{% endblock %}',
          'OneTwoContent 2',
          '{% endblock %}',
          'OneContent 2',
          '{% endblock %}',
          '',
          '{% block two %}',
          'Base Content 2',
          '{% endblock %}',
        ].join('\n'),
        extends1 = [
          '{% extends "extends_base.html" %}',
          '',
          '{% block onetwothree %}',
          'OneTwoThree Derived Content',
          '{% endblock %}'
        ].join('\n');

      swig.compile(extends_base, { filename: 'extends_base.html' });
      tpl = swig.compile(extends1, { filename: 'extends1.html' });
      tpl({}).should.equal('Base Content 1\n\n\nOneContent 1\n\nOneTwoContent 1\n\nOneTwoThree Derived Content\n\nOneTwoContent 2\n\nOneContent 2\n\n\nBase Content 2\n');
    });

    it('can be done without inheritance', function () {
      var tpl,
        extends_base = [
          'Base Content 1',
          '',
          '{% block one %}',
          'OneContent 1',
          '{% block onetwo %}',
          'OneTwoContent',
          '{% endblock %}',
          'OneContent 2',
          '{% endblock %}',
          '',
          'Base Content 2'
        ].join('\n'),
        extends_base2;

      tpl = swig.compile(extends_base, { filename: 'extends_base.html' });
      tpl({}).should.equal('Base Content 1\n\n\nOneContent 1\n\nOneTwoContent\n\nOneContent 2\n\n\nBase Content 2');

      extends_base2 = [
        'Base Content 1',
        '',
        '{% block one %}',
        'OneContent 1',
        '{% block onetwo %}',
        'OneTwoContent 1',
        '{% block onetwothree %}',
        'OneTwoThreeContent',
        '{% endblock %}',
        'OneTwoContent 2',
        '{% endblock %}',
        'OneContent 2',
        '{% endblock %}',
        '',
        'Base Content 2'
      ].join('\n');

      tpl = swig.compile(extends_base2, { filename: 'extends_base2.html' });
      tpl({}).should.equal('Base Content 1\n\n\nOneContent 1\n\nOneTwoContent 1\n\nOneTwoThreeContent\n\nOneTwoContent 2\n\nOneContent 2\n\n\nBase Content 2');
    });

    it('can reference parents', function () {
      var tpl,
        extends_base = [
          'Base Content 1',
          '',
          '{% block one %}',
          'OneContent 1',
          '{% block onetwo %}',
          'OneTwoContent',
          '{% endblock %}',
          'OneContent 2',
          '{% endblock %}',
          '',
          '{% block two %}',
          'Base Content 2',
          '{% endblock %}',
        ].join('\n'),
        extends1 = [
          '{% extends "extends_base.html" %}',
          '',
          '{% block onetwo %}',
          '{% parent %}',
          '{% endblock %}'
        ].join('\n');

      swig.compile(extends_base, { filename: 'extends_base.html' });
      tpl = swig.compile(extends1, { filename: 'extends1.html' });
      tpl({}).should.equal('Base Content 1\n\n\nOneContent 1\n\n\nOneTwoContent\n\n\nOneContent 2\n\n\nBase Content 2\n');
    });

    it('can override nested blocks', function () {
      var tpl,
        extends_base = [
          'Base Content 1',
          '',
          '{% block one %}',
          'OneContent 1',
          '{% block onetwo %}',
          'OneTwoContent',
          '{% endblock %}',
          'OneContent 2',
          '{% endblock %}',
          '',
          '{% block two %}',
          'Base Content 2',
          '{% endblock %}',
        ].join('\n'),
        extends1 = [
          '{% extends "extends_base.html" %}',
          '',
          '{% block one %}',
          'DerivedContent',
          '{% endblock %}'
        ].join('\n');

      swig.compile(extends_base, { filename: 'extends_base.html' });
      tpl = swig.compile(extends1, { filename: 'extends1.html' });
      tpl({}).should.equal('Base Content 1\n\n\nDerivedContent\n\n\nBase Content 2\n');
    });

    it('set', function () {
      var tpl,
        extends_base = [
          'Base Content 1',
          '',
          '{% block one %}',
          'OneContent 1',
          '{{ foo }}',
          '{% block onetwo %}',
          'OneTwoContent',
          '{% endblock %}',
          'OneContent 2',
          '{% endblock %}',
          '',
          '{% block two %}',
          'Base Content 2',
          '{% endblock %}',
        ].join('\n'),
        extends1 = [
          '{% extends "extends_base.html" %}',
          '',
          '{% set foo = "bar" %}',
          '{% block onetwo %}',
          'DerivedContent',
          '{% endblock %}'
        ].join('\n');

      swig.compile(extends_base, { filename: 'extends_base.html' });
      tpl = swig.compile(extends1, { filename: 'extends1.html' });
      tpl({}).should.equal('Base Content 1\n\n\nOneContent 1\nbar\n\nDerivedContent\n\nOneContent 2\n\n\nBase Content 2\n');
    });

    it('set without inheritance', function () {
      var tpl,
        extends_base = [
          'Base Content 1',
          '',
          '{% block one %}',
          'OneContent 1',
          '{% block onetwo %}',
          '{{ foo }}',
          'OneTwoContent',
          '{% endblock %}',
          'OneContent 2',
          '{% endblock %}',
          '',
          '{% block two %}',
          'Base Content 2',
          '{% endblock %}',
        ].join('\n'),
        extends1 = [
          '{% extends "extends_base.html" %}',
          '',
          '{% set foo = "bar" %}',
        ].join('\n');

      swig.compile(extends_base, { filename: 'extends_base.html' });
      tpl = swig.compile(extends1, { filename: 'extends1.html' });
      tpl({}).should.equal('Base Content 1\n\n\nOneContent 1\n\nbar\nOneTwoContent\n\nOneContent 2\n\n\nBase Content 2\n');
    });
  });
});

