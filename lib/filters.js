var _ = require('lodash');

exports.addslashes = function (input) {
  if (typeof input === 'object') {
    _.each(input, function (value, key) {
      input[key] = exports.addslashes(value);
    });
    return input;
  }
  return input.replace(/\\/g, '\\\\').replace(/\'/g, "\\'").replace(/\"/g, '\\"');
};

exports['default'] = function (input, def) {
  return (typeof input !== 'undefined' && (input || typeof input === 'number')) ? input : def;
};

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

// Magic filter, hardcoded in parser
exports.raw = function (input) {
  return input;
};
