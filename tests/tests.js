var template = require('../index'),
    tplF, tplS, array, output, d, i;

template.init(__dirname, false);

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

array = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], { af: "s", baz: "d", d: "f" }, "zeus"];
tplF = template.fromFile("include_base.html");
template.fromFile("included_2.html");
template.fromFile("included.html");

console.log("Testing includes");
d = new Date();
for (i = 0; i < 1000; i += 1) {
    output = tplF.render({ array: array, foo: "baz", "included": "included.html" });
}
console.log("====\n~" + 1000000 / (new Date() - d) + " renders per sec.");

template.fromFile("extends_base.html");
template.fromFile("extends_1.html");
tplF = template.fromFile("extends_2.html");

console.log("\nTesting extends");
d = new Date();
for (i = 0; i < 1000; i += 1) {
    tplF.render({});
}
console.log("====\n~" + 1000000 / (new Date() - d) + " renders per sec.");
