var express = require('express'),
    swig = require('../../index'),
    app = express.createServer(),
    people;

// Register the template engine
app.register('.html', swig);
app.set('view engine', 'html');

// Set the view directory
swig.init({ root: __dirname + '/views' });
app.set('views', __dirname + '/views');

// Make sure you aren't using Express's built-in layout extending
app.set('view options', { layout: false });

app.get('/', function (req, res) {
    res.render('index', {});
});

people = [
    { name: 'Paul', age: 28 },
    { name: 'Jane', age: 26 },
    { name: 'Jimmy', age: 45 }
];

app.get('/people', function (req, res) {
    res.render('people', { locals: { people: people }});
});

app.get('/people/:id', function (req, res) {
    res.render('person', { locals: { person: people[req.params.id] }});
});

app.listen(1337);
console.log('Application Started on http://localhost:1337/');
