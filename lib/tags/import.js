var utils = require('../utils');

/**
 * Allows you to import macros from another file directly into your current context.
 *
 * The import tag is specifically designed for importing macros into your template with a specific context scope. This is very useful for keeping your macros from overriding template context that is being injected by your server-side page generation.
 *
 * @alias import
 *
 * @example
 * {% import './formmacros.html' as forms %}
 * {{ form.input("text", "name") }}
 * // => <input type="text" name="name">
 *
 * @example
 * {% import "../shared/tags.html" as tags %}
 * {{ tags.stylesheet('global') }}
 * // => <link rel="stylesheet" href="/global.css">
 *
 * @param {string|var}  file      Relative path from the current template file to the file to import macros from.
 * @param {literal}     as        Literally, "as".
 * @param {literal}     varname   Local-accessible object name to assign the macros to.
 */
exports.compile = function (compiler, args, content, parents, options) {
  var parentFile = args.shift(),
    parseFile = require('../swig').parseFile,
    file = args.shift(),
    ctx = args.shift(),
    out = 'var ' + ctx + ' = {};\n' +
      '(function () {\n' +
      '  var _output = "";\n',
    tokens;

  tokens = parseFile(file.replace(/^("|')|("|')$/g, ''), { resolveFrom: options.filename }).tokens;
  utils.each(tokens, function (token) {
    var fn;
    if (!token || token.name !== 'macro' || !token.compile) {
      return;
    }
    out += ctx + '.' + token.args[0] + ' = ' + token.compile(compiler, token.args, token.content, parents, utils.extend({}, options, { resolveFrom: parentFile }));
  });

  out += '})();\n';

  return out;
};

exports.parse = function (str, line, parser, types, stack, opts) {
  var file, ctx;
  parser.on(types.STRING, function (token) {
    if (!file) {
      file = token.match;
      this.out.push(file);
      return;
    }

    throw new Error('Unexpected string ' + token.match + ' on line ' + line + '.');
  });

  parser.on(types.VAR, function (token) {
    if (!file || ctx) {
      throw new Error('Unexpected variable "' + token.match + '" on line ' + line + '.');
    }

    if (token.match === 'as') {
      return;
    }

    ctx = token.match;
    this.out.push(ctx);

    return false;
  });
  parser.on('start', function () {
    this.out.push(opts.filename);
  });

  return true;
};

