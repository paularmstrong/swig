
describe('Custom Tags', function () {
  var tags = {
    foo: function (indent) {
      return '_output += "hi!";';
    }
  };
  tags.foo.ends = true;

  it('can be included on init', function () {
    swig.init({ tags: tags });

    expect(swig.compile('{% foo %}{% endfoo %}')({}))
      .to.equal('hi!');
  });
});
