# Template Inheritance

Swig borrows much of its implementation from Django's templates–template inheritance with `extends` and `block`s are no exception.

Unlike other, more basic template languages, Swig is able to render a single template that extends from multiple templates in a chain in a very powerful way.

## Basic Example

### layout.html

    <!doctype html>
    <html>
    <head>
        <meta charset="utf-8" />
        <title>{% block title %}My Site{% endblock %}</title>

        {% block head %}
        <link rel="stylesheet" href="main.css" type="text/css" media="all" />
        {% endblock %}
    </head>
    <body>

        <header>
            <h1>{% block title %}{% endblock %}</h1>
        </header>

        <section>
        {% block content %}{% endblock %}

            <section>
                {% block sidebar %}
                <h2>Sidebar</h2>

                <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.</p>
                {% endblock %}
            </section>
        </section>

    </body>
    </html>

### child.html

    {% extends 'layout.html' %}

    {% block title %}My Page{% endblock %}

    {% block head %}
        {% parent %}
        <link rel="stylesheet" href="custom.css" type="text/css" media="all" />
    {% endblock %}

    {% block content %}
    <p>This is just an awesome page.</p>
    {% endblock %}

### Output

Since the `child.html` made a call to `{% parent %}` in the _head_ block, the main layout's _head_ content was injected into the output and then the extra content for that block was added afterward.

Notice that `child.html` only implements the title and content block. So, any blocks in the parent that are not implemented by the child will use the default content from the parent layout.

    <!doctype html>
    <html>
    <head>
        <meta charset="utf-8" />
        <title>My Page</title>

        <link rel="stylesheet" href="main.css" type="text/css" media="all" />
        <link rel="stylesheet" href="custom.css" type="text/css" media="all" />
    </head>
    <body>

        <header>
            <h1>My Page</h1>
        </header>

        <section>
        <p>This is just an awesome page.</p>

            <section>
                <h2>Sidebar</h2>

                <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.</p>
            </section>
        </section>

    </body>
    </html>
