var swig = require('../lib/swig'),
  expect = require('expect.js');

var opts = {
  locals: {
    tacos: 'tacos'
  }
};

describe('Whitespace', function () {
  describe('strips before', function () {
    it('"burritos\\n \\n{{- tacos }}\\n"', function () {
      expect(swig.render('burritos\n \n{{- tacos }}\n', opts))
        .to.equal('burritostacos\n');
    });
    it('"burritos\\n \\n{%- if tacos %}\\ntacos\\r\\n{%- endif %}\\n"', function () {
      expect(swig.render('burritos\n \n{%- if tacos %}\ntacos\r\n{%- endif %}\n', opts))
        .to.equal('burritos\ntacos\n');
    });
  });

  describe('strips after', function () {
    it('"burritos\\n \\n{{ tacos -}}\\n"', function () {
      expect(swig.render('burritos\n \n{{ tacos -}}\n', opts))
        .to.equal('burritos\n \ntacos');
    });
    it('"burritos\\n \\n{% if tacos -%}\\ntacos\\r\\n{% endif -%}\\n"', function () {
      expect(swig.render('burritos\n \n{% if tacos -%}\ntacos\n{% endif -%}\n', opts))
        .to.equal('burritos\n \ntacos\n');
    });
  });

  describe('strips both', function () {
    it('"burritos\\n \\n{{- tacos -}}\\n"', function () {
      expect(swig.render('burritos\n \n{{- tacos -}}\n', opts))
        .to.equal('burritostacos');
    });
    it('"burritos\\n \\n{%- if tacos -%}\\ntacos\\r\\n{%- endif -%}\\n"', function () {
      expect(swig.render('burritos\n \n{%- if tacos -%}\ntacos\n{%- endif -%}\n', opts))
        .to.equal('burritostacos');
    });
  });
});
