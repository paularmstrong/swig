# Swig

A fast, Django-like template engine for node.js.

Swig is a template engine inspired by the Django syntax. It has a few extensions and the templates are compiled to native javascript functions which make them really fast. For now it's synchronous, but once a template is read and compiled, it is cached in memory.

## Features

* Object-Oriented template inheritance: inherit from multiple parent templates.
* Apply variable filters and transformations in your templates.
* [Express][2] compatible!

## Installation

    npm install swig

## Basic Example

### Template code

    <h1>Example</h1>
    {% for name in names %}
      <p>
        {{ forloop.counter }}
        {# This is a comment #}
        {{ name }}{% if name == "Django" %} Reinhardt{% end %}
      </p>
    {% end %}

### node.js code

    var template  = require('Swig');
    var tmpl = template.fromFile("/path/to/template.html");
    console.log(tmpl.render({names: ["Duke", "Django", "Louis"]}));

### Output

    <h1>Example</h1>
      <p>
        1
        Duke
      </p>
      <p>
        2
        Django Reinhardt
      </p>
      <p>
        3
        Louis
      </p>
    {% end %}

## How it works

Swig reads template files and translates them into javascript functions using the Function constructor. When we later render a template we call the evaled function passing a context object as an argument. This makes the rendering very fast. The template tags are defined as strings of Javascript code - which is a bit ugly, but there are helpers that will make writing tags easier for you.

## Template syntax

While Swig is inspired by the [Django template syntax][1], there are a few differences:

- Filters have a different syntaxt.
- Tags like {% for %} and {% if %} are closed with a simple {% end %} tag.
- Some tags are missing or have different syntax.
- Some extra tags are available.

## License

Copyright (c) 2010-2011 Paul Armstrong, Dusko Jordanovski

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[1]: http://djangoproject.com/
[2]: http://expressjs.com/