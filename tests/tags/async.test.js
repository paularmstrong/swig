var swig = require('../../lib/swig'),
  expect = require('expect.js'),
  _ = require('lodash'),
  Swig = swig.Swig;


describe('Tag: async', function () {

    function func(done,arg) { done(arg + '!')};

    it('can run asynchronously', function (done) {
        swig.render('{% async %}{{ func(done,"OK") }}{% endasync %}', { func:func}, function (err, output) {
            expect(output).to.equal('OK!');
            done();
        });
    });

});
