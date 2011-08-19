# Variable tags

Used to print a variable to the template. If the variable is not in the context we don't get an error, rather an empty string. You can use dot notation to access object proerties or array memebers.

    <p>First Name: {{users.0.first_name}}</p>

# Comment tags

Comment tags are simply ignored. Comments can't span multitple lines.

    {# This is a comment #}

# Logic tags

## extends / block

Check django's template inheritance system for more info. Unlike django, the block tags are terminated with {% end %}, not with {% endblock %}

## include

Includes a template in it's place. The template is rendered within the current context. Does not requre closing with {% end %}.

    {% include template_path %}
    {% include "path/to/template.js" %}

## for

You can iterate arrays and objects. Access the current iteration index through 'forloop.index' which is available inside the loop.

    {% for x in y %}
      <p>{% forloop.index %}</p>
    {% end %}

## if

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

## slot

Use slots where you want highly customized content that depends heavily on dynamic data. They work in pair with widget functions that you can write yourself.

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
      analytics: function (context) {
        // this inside widget functions is bound to the widget object
        return "<script>..." + this.uaCode + "...</script>";
      },
      navigation: function (context) {
        var i, html = "";
        for (i=0; i<this.links; i++)
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

