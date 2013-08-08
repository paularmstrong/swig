var utils = require('./utils'),
  dateFormatter = require('./dateformatter');

/**
 * Backslash-escape characters that need to be escaped
 *
 * Examples:
 *
 *    {{ "\"quoted string\""|addslashes }}
 *    // => \"quoted string\"
 *
 * @param  {mixed}  input
 * @return {string}
 */
exports.addslashes = function (input) {
  if (typeof input === 'object') {
    utils.each(input, function (value, key) {
      input[key] = exports.addslashes(value);
    });
    return input;
  }
  return input.replace(/\\/g, '\\\\').replace(/\'/g, "\\'").replace(/\"/g, '\\"');
};

/**
 * Upper-case the first letter of the input and lower-case the rest
 *
 * Examples:
 *
 *    {{ "i like Burritos"|capitalize }}
 *    // => I like burritos
 *
 * @param  {mixed} input  If given an array or object, each string member will be run through the filter individually
 * @return {mixed}        Returns the same type as the input
 */
exports.capitalize = function (input) {
  if (typeof input === 'object') {
    utils.each(input, function (value, key) {
      input[key] = exports.capitalize(value);
    });
    return input;
  }
  return input.toString().charAt(0).toUpperCase() + input.toString().substr(1).toLowerCase();
};

/**
 * Format a date or Date-compatible string
 *
 * Examples:
 *
 *    now = new Date();
 *    {{ now|date('Y-m-d') }}
 *    // => 2013-08-14
 *
 * @param  {?(string|date)} input
 * @param  {string} format  PHP-style date format compatible string.
 * @param  {number=} offset Timezone offset from GMT in minutes.
 * @param  {string=} abbr   Timezone abbreviation. Used for output only.
 * @return {string}         Formatted date string
 */
exports.date = function (input, format, offset, abbr) {
  var l = format.length,
    date = new dateFormatter.DateZ(input),
    cur,
    i = 0,
    out = '';

  if (offset) {
    date.setTimezoneOffset(offset, abbr);
  }

  for (i; i < l; i += 1) {
    cur = format.charAt(i);
    if (dateFormatter.hasOwnProperty(cur)) {
      out += dateFormatter[cur](date, offset, abbr);
    } else {
      out += cur;
    }
  }
  return out;
};

/**
 * If the input is `undefined`, `null`, or `false`, a default return value can be specified.
 *
 * Examples:
 *
 *    {{ null_value|default('Tacos') }}
 *    // => Tacos
 *
 *    {{ "Burritos"|default("Tacos") }}
 *    // => Burritos
 *
 * @param  {mixed}  input
 * @param  {mixed}  def     Value to return if `input` is `undefined`, `null`, or `false`.
 * @return {mixed}          `input` or `def` value.
 */
exports['default'] = function (input, def) {
  return (typeof input !== 'undefined' && (input || typeof input === 'number')) ? input : def;
};

/**
 * Force escape the output of the variable. Optionally use `e` as a shortcut filter name. This filter will be applied by default if autoescape is turned on.
 *
 * Examples:
 *
 *    {{ "<blah>"|escape }}
 *    // => &lt;blah&gt;
 *
 *    {{ "<blah>"|e("js") }}
 *    // => \u003Cblah\u003E
 *
 * @param  {?string} input
 * @param  {string=} type   If you pass the string js in as the type, output will be escaped so that it is safe for JavaScript execution.
 * @return {string}         Escaped string.
 */
exports.escape = exports.e = function (input, type) {
  if (typeof input !== 'string') {
    return input;
  }

  var i = 0,
    out = '',
    code;

  switch (type) {
  case 'js':
    input = input.replace(/\\/g, '\\u005C');
    for (i; i < input.length; i += 1) {
      code = input.charCodeAt(i);
      if (code < 32) {
        code = code.toString(16).toUpperCase();
        code = (code.length < 2) ? '0' + code : code;
        out += '\\u00' + code;
      } else {
        out += input[i];
      }
    }
    return out.replace(/&/g, '\\u0026')
      .replace(/</g, '\\u003C')
      .replace(/>/g, '\\u003E')
      .replace(/\'/g, '\\u0027')
      .replace(/"/g, '\\u0022')
      .replace(/\=/g, '\\u003D')
      .replace(/-/g, '\\u002D')
      .replace(/;/g, '\\u003B');

  default:
    return input.replace(/&(?!amp;|lt;|gt;|quot;|#39;)/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
};

/**
 * Get the first item in an array or character in a string.
 *
 * Examples:
 *
 *    my_arr = ['a', 'b', 'c']
 *    {{ my_arr|first }}
 *    // => a
 *
 *    my_val = 'Tacos'
 *    {{ my_val|first }}
 *    // T
 *
 * @param  {(string|array)} input
 * @return {mixed}                  The first item of the array or first character of the string input.
 */
exports.first = function (input) {
  if (typeof input === 'object' && !utils.isArray(input)) {
    return '';
  }

  if (typeof input === 'string') {
    return input.substr(0, 1);
  }

  return input[0];
};

/**
 * Join the input with a string.
 *
 * Examples:
 *
 *    my_array = ['foo', 'bar', 'baz']
 *    {{ my_array|join(', ') }}
 *    // => foo, bar, baz
 *
 *    my_key_object = { a: 'foo', b: 'bar', c: 'baz' }
 *    {{ my_key_object|join(' and ') }}
 *    // => foo and bar and baz
 *
 * @param  {mixed}  input
 * @param  {string} glue    String value to join items together.
 * @return {string}
 */
exports.join = function (input, glue) {
  if (utils.isArray(input)) {
    return input.join(glue);
  }

  if (typeof input === 'object') {
    var out = [];
    utils.each(input, function (value) {
      out.push(value);
    });
    return out.join(glue);
  }
  return input;
};

/**
 * Return a string representation of an JavaScript object.
 *
 * Backwards compatible with swig@0.x.x using `json_encode`.
 *
 * Examples:
 *
 *    val = { a: 'b' }
 *    {{ val|json }}
 *    // => {"a":"b"}
 *
 *    {{ val|json(4) }}
 *    // => {
 *    //        "a": "b"
 *    //    }
 *
 * @param  {mixed}    input
 * @param  {number=}  indent  Number of spaces to indent for pretty-formatting
 * @return {string}           A valid JSON string
 */
exports.json = exports.json_encode = function (input, indent) {
  return JSON.stringify(input, null, indent || 0);
};

/**
 * Get the last item in an array or character in a string.
 *
 * Examples:
 *
 *    my_arr = ['a', 'b', 'c']
 *    {{ my_arr|last }}
 *    // => c
 *
 *    my_val = 'Tacos'
 *    {{ my_val|last }}
 *    // s
 *
 * @param  {(string|array)} input
 * @return {mixed}                  The last item of the array or last character of the string input.
 */
exports.last = function (input) {
  if (typeof input === 'object' && !utils.isArray(input)) {
    return '';
  }

  if (typeof input === 'string') {
    return input.charAt(input.length - 1);
  }

  return input[input.length - 1];
};

/**
 * Return the input in all lowercase letters.
 *
 * Examples:
 *
 *    {{ "FOOBAR"|lower }}
 *    // => foobar
 *
 *    myObj = { a: 'FOO', b: 'BAR' }
 *    {{ myObj|lower|join('') }}
 *    // => foobar
 *
 * @param  {mixed}  input
 * @return {mixed}          Returns the same type as the input.
 */
exports.lower = function (input) {
  if (typeof input === 'object') {
    utils.each(input, function (value, key) {
      input[key] = exports.lower(value);
    });
    return input;
  }
  return input.toString().toLowerCase();
};

/**
 * Forces the input to not be auto-escaped. Use this only on content that you know is safe to be rendered on your page.
 *
 * Examples:
 *
 *    my_var = "<p>Stuff</p>";
 *    {{ my_var|raw }}
 *    // => <p>Stuff</p>
 *
 * @param  {mixed}  input
 * @return {mixed}          Raw, un-escaped output.
 */
exports.raw = function (input) {
  // This is a magic filter. Its logic is hard-coded into Swig's parser.
  return input;
};

/**
 * Returns a new string with the matched search pattern replaced by the given replacement string. Uses JavaScript's built-in String.replace() method.
 *
 * Examples:
 *
 *    my_var = 'foobar';
 *    {{ my_var|replace('o', 'e', 'g') }}
 *    // => feebar
 *
 *    my_var = "farfegnugen";
 *    {{ my_var|replace('^f', 'p') }}
 *    // => parfegnugen
 *
 *    my_var = 'a1b2c3';
 *    {{ my_var|replace('\w', '0', 'g') }}
 *    // => 010203
 *
 * @param  {string} input
 * @param  {string} search      String or pattern to replace from the input.
 * @param  {string} replacement String to replace matched pattern.
 * @param  {string=} flags      Regular Expression flags. 'g': global match, 'i': ignore case, 'm': match over multiple lines
 * @return {string}             Replaced string.
 */
exports.replace = function (input, search, replacement, flags) {
  var r = new RegExp(search, flags);
  return input.replace(r, replacement);
};

exports.reverse = function (input) {
  if (utils.isArray(input)) {
    return input.reverse();
  }
  return input;
};

exports.striptags = function (input) {
  if (typeof input === 'object') {
    utils.each(input, function (value, key) {
      input[key] = exports.striptags(value);
    });
    return input;
  }
  return input.toString().replace(/(<([^>]+)>)/ig, '');
};

exports.title = function (input) {
  if (typeof input === 'object') {
    utils.each(input, function (value, key) {
      input[key] = exports.title(value);
    });
    return input;
  }
  return input.toString().replace(/\w\S*/g, function (str) {
    return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
  });
};

exports.uniq = function (input) {
  var result;

  if (!input || !utils.isArray(input)) {
    return '';
  }

  result = [];
  utils.each(input, function (v) {
    if (result.indexOf(v) === -1) {
      result.push(v);
    }
  });
  return result;
};

exports.upper = function (input) {
  if (typeof input === 'object') {
    utils.each(input, function (value, key) {
      input[key] = exports.upper(value);
    });
    return input;
  }
  return input.toString().toUpperCase();
};

exports.url_encode = function (input) {
  return encodeURIComponent(input);
};

exports.url_decode = function (input) {
  return decodeURIComponent(input);
};
