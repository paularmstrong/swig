# Swig in Your Browser

To compile Swig for rendering in the browser, clone the Swig repository and run the following in your command-line:

    make && make browser

In the `dist/browser/` directory, you will see 4 files:

Swig relies heavily on [underscore.js](http://documentcloud.github.com/underscore/). Because of this, there are two versions of Swig built for the browser. In `dist/browser/`, you will see 4 files:

1. _swig.js_ and _swig.min.js_
1. _swig.pack.js_ and _swig.pack.min.js_

You should only need one of these. If you already include _underscore.js_ in your website, choose _swig.js_ for development and _swig.min.js_ for production. If you have not included _underscore.js_ and you don't intend to, choose _swig.pack.js_ for development and _swig.pack.min.js_ for production.

## The API

Swig's API in the browser is the same as [its API for node.js](getting-started.md), with the only difference being that you cannot use the `swig.fromFile` method, since browsers do not have a filesystem.

Instead, you must always use `swig.fromString` and pre-parse all templates.

In order to use `extends`, `import`, and `include` correctly, another argument is available on `swig.fromString`: `templateKey`

    swig.fromString(templateString, templateKey);

This is the key that will be used to lookup a template. For instance:

    var template = swig.fromString('<p>{% block content %}{% endblock %}</p>', 'main');
    var mypage = swig.fromString('{% extends "main" %}{% block content %}Oh hey there!{% endblock %}');

When you render mypage, `mypage.render({});`, you will see

    <p>Oh hey there!</p>

## Known Issues

* Opera and Internet Explorer fail to comply with the date filter format `r`.
* Internet Explorer 9.0 **in compatibility mode** and IE 6 through 8:
    * Is unable to compute the ISO date time for date filter formate `c`.
    * Does not handle unicode properly and so it fails to escape output for `'js'`.
