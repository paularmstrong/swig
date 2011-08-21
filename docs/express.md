# Using Node-T in Express for View Rendering

Node-T is compatible with [Express][1]! It's very easy to set up your Express-based node project to use Node-T as its template renderer. Here's how:

Require `express`, `node-t`, and create the express server.

    var express = require('express'),
        nodet = require('node-t'),
        app = express.createServer();

Register Node-T as the template renderer.

    app.register('.html', nodet);
    app.set('view engine', 'html');

Set up your views directory.

    nodet.init({ root: '/path/to/views/directory/' });
    app.set('views', '/path/to/views/directory/');

**Important!** Don't allow express to automatically pipe your template into a `layout.html` file. Setting this to false allows you to properly use `{% extends %}` and `{% block %}` tags!

    app.set('view options', { layout: false });

Render your `index.html` page!

    app.get('/', function (req, res) {
        res.render('index.html', { foo: 'bar' });
    });

[1]:http://expressjs.com/