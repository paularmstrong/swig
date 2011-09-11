# The API

You have 2 methods for creating a template object:

    swig.fromFile("path/to/template/file.html");
    swig.fromString("Template string here");


Swig can be configured using the following:

    swig.init({
        autoescape: true,   // Automatically escape all variable output. (Recommended true)
        encoding: 'utf8',   // Encoding for template files.
        root: '/views',     // The root directory to search for templates.
        filters: {},        // Optional custom filters.
        tags: {},           // Optional custom tags.
        allowErrors: false  // If true, allows errors to be thrown when parsing and rendering.
    });

Both of them will give you a template object on which you call the render method passing it a map of context values.

    var tmpl = swig.fromFile("path/to/template/file.html");
    var renderedHtml = tmpl.render({ vars: 'to be inserted in template' });
