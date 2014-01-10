var swig = require('../lib/swig'),
  expect = require('expect.js'),
  path = require('path'),
  fs = require('fs');


describe('swig.loaders', function () {

  describe('Memory', function () {
    it('can use extends', function () {
      var templates, html, s;

      templates = {
        'page.html': '{% extends "layout.html" %}{% block content %}Hello {{ name }}!{% endblock %}'
      };
      templates[path.sep + 'layout.html'] = '<html>{% block content %}{% endblock %}</html>';

      s = new swig.Swig({ loader: new swig.loaders.memory(templates) });
      html = s.renderFile('page.html', {name: 'world'});
      expect(html).to.equal('<html>Hello world!</html>');
    });

    it('can use include', function () {
      var templates, s, html;

      templates = {
        'page.html': '<html>{% include "content.html" %}</html>',
        'content.html': 'Hello {{ name }}!'
      };

      s = new swig.Swig({ loader: new swig.loaders.memory(templates) });
      html = s.renderFile('page.html', {name: 'world'});
      expect(html).to.equal('<html>Hello world!</html>');
    });

    it('can use base paths', function () {
      var templates, s, html;

      templates = {
        '/baz/bar/page.html': '<html>{% include "content.html" %}</html>',
        '/baz/content.html': 'Hello {{ name }}!'
      };

      s = new swig.Swig({ loader: new swig.loaders.memory(templates, '/baz') });
      html = s.renderFile('bar/page.html', {name: 'world'});
      expect(html).to.equal('<html>Hello world!</html>');
    });
  });

  // The following tests should *not* run in the browser
  if (!fs || !fs.readFileSync) {
    return;
  }
  describe('FileSystem', function () {
    it('is the default', function () {
      var s = new swig.Swig(),
        file = s.options.loader.load(__dirname + '/cases/macros.html');
      expect(typeof file).to.be.a('string');
    });

    it('can take a base path', function () {
      var s = new swig.Swig({ loader: swig.loaders.fs(__dirname + '/cases') });
      expect(s.renderFile('macros.html')).to.equal('\n\nasfdasdf\n\n\n\n\nHahahahahah!\n\n\n\n\n\n');
    });
  });

});


