# The API

You have 2 methods for creating a template object:

    var template = require('node-slots');
    template.fromFile("path/to/template/file.html");
    template.fromString("Template string here");

Both of them will give you a template object on which you call the render method passing it a map of context values.

    var tmpl = template.fromFile("path/to/template/file.html");
    var renderdHtml = tmpl.render({});

