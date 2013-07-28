var _ = require('lodash');

exports.compile = function (compiler, args, content, parent, options) {
  var file = args.shift(),
    src = '',
    out = '(function () {\n' +
      '_output += _swig.compileFile("' + file + '", {' +
        (options.locals ? 'locals: ' + JSON.stringify(options.locals) + ',' : '') +
        'resolveFrom: "' + options.filename + '"' +
        '})();';

  out += src + '})();\n';

  return out;
};

exports.parse = function (str, line, parser, types) {
  var file;
  parser.on(types.STRING, function (token) {
    if (!file) {
      file = token.match;
      this.out.push(file.replace(/^("|')|("|')$/g, ''));
      return;
    }

    throw new Error('Unexpected string "' + token.match + '" on line ' + line + '.');
  });

  parser.on(types.VAR, function (token) {
    if (!file) {
      file = token.match;
      return true;
    }

    throw new Error('Unexpected variable "' + token.match + '" on line ' + line + '.');
  });

  return true;
};

