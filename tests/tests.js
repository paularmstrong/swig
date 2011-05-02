var template = require("node-t");

template.init(".", false);

var print = require('util').puts;
var tplF, tplS, array;

tplS = template.fromString(
    "{% for v in array %}"
  +   "{% if 1 %}"
  +     "{% for k in v %}"
  +       "\n{{forloop.index}} {{k}}: "
  +       "{% if forloop.index in 'msafas' %}"
  +         "<p>Hello World {{k}}{{foo}}{{k}}{{foo}}{{k}}{{foo}}</p>"
  +       "{% end %}"
  +     "{% end %}"
  +   "{% end %}"
  + "{% end %}"
);

array = [[1,2,3,4,5,6,7,8,9,10], [1,2,3,4,5,6,7,8,9,10], [1,2,3,4,5,6,7,8,9,10], {af:"s", baz:"d", d:"f"}, "zeus"];
tplF = template.fromFile("include_base.html");
template.fromFile("included_2.html");
template.fromFile("included.html");

print("\nTesting includes");
var d = new Date();
for( var i=0; i<1000; ++i )
  output = tplF.render( { array: array, foo: "baz", "included": "included.html" } );
print( "====\n~" + 1000000 / (new Date() - d) + " renders per sec." );

template.fromFile("extends_base.html");
template.fromFile("extends_1.html");
tplF = template.fromFile("extends_2.html");

print("\nTesting extends");
var d = new Date();
for( var i=0; i<1000; ++i )
  tplF.render({});
print( "====\n~" + 1000000 / (new Date() - d) + " renders per sec." );
