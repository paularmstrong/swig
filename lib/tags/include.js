var _ = require('lodash');

exports.compile = function (compiler, args, content, parent, options) {
  var file = args.shift(),
    w = args.join('');

  return '(function () {\n' +
    '  _output += _swig.compileFile("' + file + '", { ' +
    'resolveFrom: "' + options.filename + '"' +
    ' })(' + (w || '_ctx') + ');\n' +
    '})();\n';
};

exports.parse = function (str, line, parser, types) {
  var file, w;
  parser.on(types.STRING, function (token) {
    if (!file) {
      file = token.match;
      this.out.push(file.replace(/^("|')|("|')$/g, ''));
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

    return true;
  });

  return true;
};

