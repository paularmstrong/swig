Getting Started <a name="getting-started" href="#getting-started">#</a>
===============

Init Swig <a name="init" href="#init">#</a>
---------

In order to start using Swig, you should initialize it. Swig can be configured using the following:

    swig.init({
        allowErrors: false,
        autoescape: true,
        encoding: 'utf8',
        filters: {},
        root: '/',
        tags: {}
    });

This step is _optional_, however it is recommended to at least set the `root` key when running Swig from node.js.

### Options

#### allowErrors _optional_

Default is `false`. Keeping this off will render all template parsing and compiling errors straight to the template output. If `true`, errors will be thrown straight to the Node.js process, potentially crashing your application.

#### autoescape _optional_

Automatically escape all variable output. This is the default behavior and it is highly recommended to leave this on.

##### Possible Values

* `true` - Will escape output safe for HTML.
* `false` - Will not escape any output unless forced via the [escape filter](filters.md#escape) or [autoescape tag](tags.md#escape).
* `'js'` - Will escape output safe for JavaScript.

For character conversion tables, see the [escape filter](filters.md#escape).

#### encoding _optional_

The character encoding for template files. Defaults to `utf8`.

#### filters _optional_

Use this to set any custom filters and/or override any of the built-in filters. For more information on writing your own filters, see the [custom filters guide](filters.md#custom_filters).

#### root _optional_

The directory to search for templates. If a template passed to `swig.fromFile` is an absolute path (starts with `/`), Swig will not look in the template root.

#### tags _optional_

Use this to set any custom tags and/or override any of the built-in tags. For more information on writing your own tags, see the [custom tags guide](custom-tags.md).

Parsing a Template <a name="parsing" href="#parsing">#</a>
------------------

You have 2 methods for creating a template object:

    swig.fromFile("path/to/template/file.html");
    swig.fromString("Template string here");

Rendering a Template <a name="rendering" href="#rendering">#</a>
--------------------

Both of these methods will give you a template object on which you call the render method passing it a map of context values.

    var tpl = swig.fromFile("path/to/template/file.html");
    var renderedHtml = tpl.render({ vars: 'to be inserted in template' });
