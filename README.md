# Swig

[Swig](http://paularmstrong.github.com/swig/) is a fast, Django-like template engine for node.js.

## Features

* Incredibly [fast](http://paularmstrong.github.com/node-templates/)!
* [Express](http://expressjs.com/) compatible.
* Object-Oriented template inheritance.
* Apply filters and transformations to output in your templates.
* Automatically escapes all output.
* Lots of iteration and conditionals supported.
* Extendable and customizable.

## Installation

    npm install swig

## Documentation

All documentation can be viewed online. [Documentation Table of Contents](https://github.com/paularmstrong/swig/blob/master/docs)

## Basic Example

### Template code

    <h1>{{ pagename|title }}</h1>
    <ul>
    {% for author in authors %}
        <li{% if forloop.index <= 0 %} class="first"{% endif %}>{{ author }}</li>
    {% empty %}
        <li>There are no authors.</li>
    {% endfor %}
    </ul>

### node.js code

    var template  = require('Swig');
    var tmpl = template.fromFile('/path/to/template.html');
    tmpl.render({
        pagename: 'awesome people',
        authors: ['Paul', 'Jim', 'Jane']
    });

### Output

    <h1>Awesome People</h1>
    <ul>
        <li class="first">Paul</li>
        <li>Jim</li>
        <li>Jane</li>
    </ul>

## How it works

Swig reads template files and translates them into javascript functions using the Function constructor. When we later render a template we call the evaled function passing a context object as an argument. This makes the rendering very fast. The template tags are defined as strings of Javascript code - which is a bit ugly, but there are helpers that will make writing tags easier for you.

## Template syntax

While Swig is inspired by the [Django template syntax](http://djangoproject.com/), there are a few differences:

- Filters have a different syntaxt.
- Some tags are missing or have different syntax.
- Some extra tags are available.

## License

Copyright (c) 2010-2011 Paul Armstrong, Dusko Jordanovski

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
