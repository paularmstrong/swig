var util = require('util'),
  swig = require('../index');

describe('Custom Tags', function () {
  var tags = {
    foo: function (indent) {
      return '_output += "hi!";';
    }
  };
  tags.foo.ends = true;

  it('can be included on init', function () {
    swig.init({ tags: tags });

    swig.compile('{% foo %}{% endfoo %}')({}).should.equal('hi!');
  });
});
