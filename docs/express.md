# Using Swig in Express for View Rendering

Swig is compatible with [Express][1]! It's very easy to set up your Express-based node project to use Swig as its template renderer. Here's how:

Require `express`, `Swig`, and create the express server.

    var express = require('express'),
        swig = require('swig'),
        app = express.createServer();

Register Swig as the template renderer.

    app.register('.html', swig);
    app.set('view engine', 'html');

Set up your views directory.

    swig.init({ root: '/path/to/views/directory/' });
    app.set('views', '/path/to/views/directory/');

**Important!** Don't allow express to automatically pipe your template into a `layout.html` file. Setting this to false allows you to properly use `{% extends %}` and `{% block %}` tags!

    app.set('view options', { layout: false });

Render your `index.html` page!

    app.get('/', function (req, res) {
        res.render('index.html', { foo: 'bar' });
    });

[1]:http://expressjs.com/