var template = require('../index'),
    tplF, tplS, array, output, d, i;

console.log();
console.log('Starting speed tests...');

template.init({
    root: __dirname + '/templates'
});

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

i = 1000;
console.time('Render 1000 Includes Templates');
d = new Date();
while (i--) {
    tplF.render({ array: array, foo: "baz", "included": "included.html" });
}
console.timeEnd('Render 1000 Includes Templates');
console.log("    ~ " + Math.round(1000000 / (new Date() - d)) + " renders per sec.");

template.fromFile("extends_base.html");
template.fromFile("extends_1.html");
tplF = template.fromFile("extends_2.html");

i = 1000;
console.time('Render 1000 Extends Templates');
d = new Date();
while (i--) {
    tplF.render({ array: array, foo: "baz", "included": "included.html" });
}
console.timeEnd('Render 1000 Extends Templates');
console.log("    ~ " + Math.round(1000000 / (new Date() - d)) + " renders per sec.");
