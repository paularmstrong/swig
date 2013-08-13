var ignore = 'ignore',
  missing = 'missing';

/**
 * Includes a template partial in place. The template is rendered within the current locals variable context.
 *
 * @alias include
 *
 * @example
 * // food = 'burritos';
 * // drink = 'lemonade';
 * {% include "./partial.html" %}
 * // => I like burritos and lemonade.
 *
 * @example
 * // my_obj = { food: 'tacos', drink: 'horchata' };
 * {% include "./partial.html" with my_obj %}
 * // => I like tacos and horchata.
 *
 * @param {string|var}  file      The path, relative to the template root, to render into the current context.
 * @param {literal}     [with]    Literally, "with".
 * @param {object}      [context] Restrict the local variable context in the file to this key-value object.
 */
exports.compile = function (compiler, args, content, parent, options) {
  var file = args.shift(),
    ignore = args[args.length - 1] === missing ? (args.pop()) : false,
    w = args.join('');

  return '(function () {\n' +
    (ignore ? '  try {\n' : '') +
    '    _output += _swig.compileFile(' + file + ', {' +
    'resolveFrom: "' + options.filename + '"' +
    '})(' + (w || '_ctx') + ');\n' +
    (ignore ? '} catch (e) {}\n' : '') +
    '})();\n';
};

exports.parse = function (str, line, parser, types) {
  var file, w;
  parser.on(types.STRING, function (token) {
    if (!file) {
      file = token.match;
      this.out.push(file);
      return;
    }

    return true;
  });

  parser.on(types.VAR, function (token) {
    if (!file) {
      file = token.match;
      return true;
    }

    if (!w && token.match === 'with') {
      w = true;
      return;
    }

    if (token.match === ignore) {
      return false;
    }

    if (token.match === missing) {
      if (this.prevToken.match !== ignore) {
        throw new Error('Unexpected token "' + missing + '" on line ' + line + '.');
      }
      this.out.push(token.match);
      return false;
    }

    if (this.prevToken.match === ignore) {
      throw new Error('Expected "' + missing + '" on line ' + line + ' but found "' + token.match + '".');
    }

    return true;
  });

  return true;
};
