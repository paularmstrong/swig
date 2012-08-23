Using Swig in Express for View Rendering <a name="express" href="#express">#</a>
========================================

Swig is compatible with [Express][1]! It's very easy to set up your Express-based node project to use Swig as its template renderer. Here's how:

Note: these instructions are for Express 3.

Load the required packages in your package.json file.
    ...
    "consolidate": "*",
    "swig": "*"
    
Require `express`, `consolidate` and `swig`, and create the express server.

    var express = require('express'),
        cons = require('consolidate'),
        swig = require('swig'),
        app = express.createServer();

Register Swig as the template renderer.

    app.register('.html', swig);
    app.set('view engine', 'html');

Set up your views directory.

    swig.init({
        root: '/path/to/views/directory/',
        allowErrors: true // allows errors to be thrown and caught by express
    });
    app.set('views', '/path/to/views/directory/');

Render your `index.html` page!

    app.get('/', function (req, res) {
        res.render('index.html', { foo: 'bar' });
    });

[1]:http://expressjs.com/