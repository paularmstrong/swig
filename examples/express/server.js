var express = require('express'),
  swig = require('../../index'),
  http = require('http'),
  app = express(),
  people;

// NOTE: It is preferred to use consolidate.js
// However, we can't do that in this example, because the example uses
// The uninstalled version of swig for testing purposes
// Please see the documentation for proper use with Express

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
// Optional: use swig's caching methods
// app.set('view cache', false);

app.get('/', function (req, res) {
  res.render('index', {});
});

app.get('/people', function (req, res) {
  res.render('people', { people: people });
});

app.get('/people/:id', function (req, res) {
  res.render('person', { person: people[req.params.id] });
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
