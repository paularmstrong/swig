var swig = require('../lib/swig'),
  expect = require('expect.js');

var opts = {
  locals: {
    tacos: 'tacos'
  },
  allowCR: true
};

describe('CR', function () {
  describe('strips before, escaping CR+LF', function () {
    it('"burritos\\r\\n \\r\\n{{- tacos }}\\r\\n"', function () {
      expect(swig.render('burritos\r\n \r\n{{- tacos }}\r\n', opts))
        .to.equal('burritostacos\r\n');
    });
    it('"burritos\\r\\n \\r\\n{%- if tacos %}\\r\\ntacos\\r\\n{%- endif %}\\r\\n"', function () {
      expect(swig.render('burritos\r\n \r\n{%- if tacos %}\r\ntacos\r\n{%- endif %}\r\n', opts))
        .to.equal('burritos\r\ntacos\r\n');
    });
  });

  describe('strips after, escaping CR+LF', function () {
    it('"burritos\\r\\n \\r\\n{{ tacos -}}\\r\\n"', function () {
      expect(swig.render('burritos\r\n \r\n{{ tacos -}}\r\n', opts))
        .to.equal('burritos\r\n \r\ntacos');
    });
    it('"burritos\\r\\n \\r\\n{% if tacos -%}\\r\\ntacos\\r\\n{% endif -%}\\r\\n"', function () {
      expect(swig.render('burritos\r\n \r\n{% if tacos -%}\r\ntacos\r\n{% endif -%}\r\n', opts))
        .to.equal('burritos\r\n \r\ntacos\r\n');
    });
  });

  describe('strips both, escaping CR+LF', function () {
    it('"burritos\\r\\n \\r\\n{{- tacos -}}\\r\\n"', function () {
      expect(swig.render('burritos\r\n \r\n{{- tacos -}}\r\n', opts))
        .to.equal('burritostacos');
    });
    it('"burritos\\r\\n \\r\\n{%- if tacos -%}\\r\\ntacos\\r\\n{%- endif -%}\\r\\n"', function () {
      expect(swig.render('burritos\r\n \r\n{%- if tacos -%}\r\ntacos\r\n{%- endif -%}\r\n', opts))
        .to.equal('burritostacos');
    });
  });
});
