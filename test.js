var swig = require('./index.js'),
  expect = require('expect.js');

describe('wooo', function () {
  it('parses stuff?', function () {
    expect(swig.compile('{{ foo }}')({ foo: 'hi' })).to.eql('hi');
  });
});
