# Node-T

A fast django-like templating engine for node.js.

Node-T is a templating engine inspired by the django syntax. It has a few extensions and the templates are compiled to native javascript functions which make them really fast. For now it's synchronous, but once a template is read and compiled, it is cached in memory.

### Example template code
    
    <html>
    <body>
      <h1>Example</h1>
      {% for name in names %}
        <p>
          {{forloop.counter}}
          {# This is a comment #}
          {{name}}{% if name == "Django" %} Reinhardt{% end %}
        </p>
      {% end %}
    </body>
    </html>

### Example node code

    var template  = require('node-t');
    var tmpl = template.fromFile("/path/to/template.html");
    console.log( tmpl.render({names: ["Duke", "Django", "Louis"]}) );

### How it works

Node-T reads template files and translates them into javascript functions using the Function constructor. When we later render a template we call the evaled function passing a context object as an argument. This makes the rendering very fast. The template tags are defined as strings of Javascript code - which is a bit ugly, but there are helpers that will make writing tags easier for you.

The slots system will allow you to define your own HTML snippets that will be rendered with a special context.

## The API

You have 2 methods for creating a template object:

    var template = require('node-slots');
    template.fromFile("path/to/template/file.html");
    template.fromString("Template string here");

Both of them will give you a template object on which you call the render method passing it a map of context values.

    var tmpl = template.fromFile("path/to/template/file.html");
    var renderdHtml = tmpl.render({});

## Template syntax

You should be familiar with the [1]"Django template syntax". Here I'll just sum up the diferences:

- There are no filters implemented yet
- Tags like {% for %} and {% if %} are closed with a simple {% end %} tag
- Not all tags are implemented
- Some extra tags are implemented
- Syntax for some tags is a bit different.

Here's a list of currently implemented tags:

### Variable tags

Used to print a variable to the template. If the variable is not in the context we don't get an error, rather an empty string. You can use dot notation to access object proerties or array memebers.

    <p>First Name: {{users.0.first_name}}</p>

### Comment tags

Comment tags are simply ignored. Comments can't span multitple lines.

    {# This is a comment #}

### Logic tags

#### extends / block

Check django's template inheritance system for more info. Unlike django, the block tags are terminated with {% end %}, not with {% endblock %}

#### include

Includes a template in it's place. The template is rendered within the current context. Does not requre closing with {% end %}.
  
    {% include template_path %}
    {% include "path/to/template.js" %}

#### for

You can iterate arrays and objects. Access the current iteration index through 'forloop.index' which is available inside the loop.

    {% for x in y %}
      <p>{% forloop.index %}</p>
    {% end %}
    
#### if

Supports the following expressions. No else tag yet.

    {% if x %}{% end %}
    {% if !x %}{% end %}
    {% if x operator y %}
      Operators: ==, !=, <, <=, >, >=, ===, !==, in
      The 'in' operator checks for presence in arrays too.
    {% end %}
    {% if x == 'five' %}
      The operands can be also be string or number literals
    {% end %}

#### slot

Slots are parts of a page that where you want highly customized content that depends heavily on dynamic data. They work in pair with widget functions that you can write yourself.

Template code
    
    <div>
      {% slot main %}
    </div>
    <div>
      {% slot sidebar %}
    </div>

Node.js code

    context.slots = {
      main: [
        "<h1>This is a paragraph as a normal string.</h1>", // String
        
        { tagname: 'analytics',   // Widget object
          uaCode: 'UA-XXXXX-X' },
      ],
      
      sidebar: [
        "<h3>Navigation</h3>",    // String
        
        { tagname: 'navigation',  // Widget object
          links: [
            '/home',
            '/about',
            '/kittens'
          ]}
      ]
    }
    
    context.widgets = {
      analytics: function(context){
        // this inside widget functions is bound to the widget object
        return "<script>..." + this.uaCode + "...</script>";
      },
      navigation: function(context){
        var i, html = "";
        for( i=0; i<this.links; i++ )
          html += "<a href='" + links[i] + "'>" + links[i] + "</a>";
        return html;
      }
    }
    
    template.render(context)

Result

    <div>
      <h1>This is a paragraph as a normal string.</h1>
      <script>...UA-XXXXX-X...</script>
    </div>
    <div>
      <h3>Navigation</h3>
      <a href='/home'>/home</a>
      <a href='/about'>/about</a>
      <a href='/kittens'>/kittens</a>
    </div>


## License

(The MIT License)

Copyright (c) 2010 Dusko Jordanovski

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[1]: http://djangoproject.com/