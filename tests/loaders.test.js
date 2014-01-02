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

      s = new swig.Swig({ loader: new swig.loaders.Memory(templates) });
      html = s.renderFile('page.html', {name: 'world'});
      expect(html).to.equal('<html>Hello world!</html>');
    });

    it('can use include', function () {
      var templates, s, html;

      templates = {
        'page.html': '<html>{% include "content.html" %}</html>',
        'content.html': 'Hello {{ name }}!'
      };

      s = new swig.Swig({ loader: new swig.loaders.Memory(templates) });
      html = s.renderFile('page.html', {name: 'world'});
      expect(html).to.equal('<html>Hello world!</html>');
    });
  });

  // The following tests should *not* run in the browser
  if (!fs || !fs.readFileSync) {
    return;
  }
  describe('FileSystem', function () {

  });

});


