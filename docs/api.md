# The API

You have 2 methods for creating a template object:

    var swig = require('swig');
    swig.fromFile("path/to/template/file.html");
    swig.fromString("Template string here");


Swig can be configured using the following:

    swig.init({
        root: '/views', // The root directory to search for templates
        debug: false, // Enable debug mode. Default is false
        autoescape: true // Configure whether or not Swig will automatically escape all variable output. Default is true.
    });

Both of them will give you a template object on which you call the render method passing it a map of context values.

    var tmpl = swig.fromFile("path/to/template/file.html");
    var renderdHtml = tmpl.render({});
