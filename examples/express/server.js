var express = require('express'),
  swig = require('../../index'),
  http = require('http'),
  app = express(),
  people;

// NOTE: It is preferred to use consolidate.js
// However, we can't do that in this example, because the example uses
// The uninstalled version of swig for testing purposes
// Please see the documentation for proper use with Express
swig._cache = {};
swig.express3 = function (path, options, fn) {
  swig._read(path, options, function (err, str) {
    if (err) {
      return fn(err);
    }
    try {
      options.filename = path;
      var tmpl = swig.compile(str, options);
      fn(null, tmpl(options));
    } catch (error) {
      fn(error);
    }
  });
};

swig._read = function (path, options, fn) {
  var str = swig._cache[path];

  // cached (only if cached is a string and not a compiled template function)
  if (options.cache && str && typeof str === 'string') {
    return fn(null, str);
  }

  // read
  require('fs').readFile(path, 'utf8', function (err, str) {
    if (err) {
      return fn(err);
    }
    if (options.cache) {
      swig._cache[path] = str;
    }
    fn(null, str);
  });
};

app.engine('html', swig.express3);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view options', { layout: false });
app.set('view cache', false);

swig.init({
  root: __dirname + '/views',
  allowErrors: true
});

app.get('/', function (req, res) {
  res.render('index', {});
});

app.get('/people', function (req, res) {
  res.render('people', { people: people });
});

app.get('/people/:id', function (req, res) {
  res.render('person', { person: people[req.params.id] });
});

app.get('/variable', function (req, res) {
  res.render('variable', { extendFile : 'outer.html' });
});

app.get('/*', function (req, res) {
  res.render(req.params[0], {});
});

people = [
  { name: 'Paul', age: 28 },
  { name: 'Jane', age: 26 },
  { name: 'Jimmy', age: 45 }
];

app.listen(1337);
console.log('Application Started on http://localhost:1337/');
