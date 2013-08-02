var utils = require('../utils'),
  _ = require('lodash');

exports.compile = function (compiler, args, content, parent, options) {
  // TODO: this won't be sustainable in the browser
  var parseFile = require('../swig').parseFile,
    file = args.shift(),
    ctx = args.shift(),
    out = 'var ' + ctx + ' = {};\n' +
      '(function () {\n' +
      '  var _output = "";\n',
    tokens;

  tokens = parseFile(file.replace(/^("|')|("|')$/g, ''), { resolveFrom: options.filename }).tokens;
  utils.each(tokens, function (token) {
    if (!token || token.name !== 'macro' || !token.compile) {
      return;
    }
    out += token.compile(compiler, token.args, token.content, parent, options);
  });

  out +=  ctx + ' = this;\n' +
    '})();\n';

  return out;
};

exports.parse = function (str, line, parser, types) {
  var file, ctx;
  parser.on(types.STRING, function (token) {
    if (!file) {
      file = token.match;
      this.out.push(file);
      return;
    }

    throw new Error('Unexpected string "' + token.match + '" on line ' + line + '.');
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

  return true;
};

