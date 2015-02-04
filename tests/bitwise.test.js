var swig = require('../lib/swig'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;

describe('Bitwise', function () {
  it('should work for b-and', function () {
    expect(swig.render('{% if 17 b-and 1 %}1{% else %}0{% endif %}')).to.equal('1');
    expect(swig.render('{% if 17 b-and 16 %}1{% else %}0{% endif %}')).to.equal('1');
    expect(swig.render('{% if 17 b-and 2 %}1{% else %}0{% endif %}')).to.equal('0');
    expect(swig.render('{% if 17 b-and 14 %}1{% else %}0{% endif %}')).to.equal('0');
    expect(swig.render('{% if 17 b-and 1 == 1 %}1{% else %}0{% endif %}')).to.equal('1');
    expect(swig.render('{% if 17 b-and 16 == 16 %}1{% else %}0{% endif %}')).to.equal('1');
    expect(swig.render('{% if 17 b-and 2 == 0 %}1{% else %}0{% endif %}')).to.equal('0');
    expect(swig.render('{% if 17 b-and 14 == 0 %}1{% else %}0{% endif %}')).to.equal('0');
  });
  it('should work for b-or', function () {
    expect(swig.render('{% if 17 b-or 1 == 17 %}1{% else %}0{% endif %}')).to.equal('1');
    expect(swig.render('{% if 17 b-or 16 == 17 %}1{% else %}0{% endif %}')).to.equal('1');
    expect(swig.render('{% if 17 b-or 2 == 19 %}1{% else %}0{% endif %}')).to.equal('1');
    expect(swig.render('{% if 17 b-or 14 == 31 %}1{% else %}0{% endif %}')).to.equal('1');
  });
  it('should work for b-xor', function () {
    expect(swig.render('{% if 17 b-xor 1 == 16 %}1{% else %}0{% endif %}')).to.equal('1');
    expect(swig.render('{% if 17 b-xor 16 == 1 %}1{% else %}0{% endif %}')).to.equal('1');
    expect(swig.render('{% if 17 b-xor 2 == 19 %}1{% else %}0{% endif %}')).to.equal('1');
    expect(swig.render('{% if 17 b-xor 14 == 31 %}1{% else %}0{% endif %}')).to.equal('1');
  });
});
