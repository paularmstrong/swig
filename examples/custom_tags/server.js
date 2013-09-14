var http = require('http'),
  swig = require('../../index'),
  urltag = require('./tag-url');

swig.setExtension('url', function (urlname) {
  var urls = {
    dashboard: '/dashboard/',
    settings: '/settings/'
  };
  return urls[urlname];
});

swig.setTag('url', urltag.parse, urltag.compile, urltag.ends, urltag.blockLevel);

http.createServer(function (req, res) {
  var output = swig.compileFile(__dirname + '/page.html')();

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(output);
}).listen(1337);

console.log('Application Started on http://localhost:1337/');
