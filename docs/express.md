Using Swig in Express for View Rendering <a name="express" href="#express">#</a>
========================================

Swig is compatible with [Express][1]! It's very easy to set up your Express-based node project to use Swig as its template renderer. Here's how:

First, get Express and Consolidate.js

    npm install express
    npm install consolidate

Require `express`, `Swig`, and create the express server.

    var express = require('express'),
        cons = require('consolidate'),
        swig = require('swig'),
        app = express.createServer();

Register Swig as the template renderer.

    app.engine('.html', cons.swig);
    app.set('view engine', 'html');

Set up your views directory.

    // NOTE: Swig requires some extra setup so that it knows where to look for includes and parent templates
    swig.init({
        root: '/path/to/views/directory/',
        allowErrors: true // allows errors to be thrown and caught by express instead of suppressed
    });
    app.set('views', '/path/to/views/directory/');

**Important!** Don't allow express to automatically pipe your template into a `layout.html` file. Setting this to false allows you to properly use `{% extends %}` and `{% block %}` tags!

Render your `index.html` page!

    app.get('/', function (req, res) {
        res.render('index.html', { foo: 'bar' });
    });

[1]:http://expressjs.com/
