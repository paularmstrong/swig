var http = require('http'),
    swig = require(__dirname + '/../../index');

swig.init({
    root: __dirname
});

http.createServer(function (req, res) {
    var tmpl = swig.compileFile('page.html'),
        renderedHtml = tmpl.render({
            people: [
                { name: 'Paul', age: 28 },
                { name: 'Jane', age: 26 },
                { name: 'Jimmy', age: 45 }
            ],
            title: 'Basic Example'
        });

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderedHtml);
}).listen(1337);

console.log('Application Started on http://localhost:1337/');
