exports.compile = function (compiler, args, content) {
  var fnName = args.shift();

  return 'function ' + fnName + '(' + args.join('') + ') {\n' +
    '  var _output = "";\n' +
    compiler(content) + '\n' +
    '  return _output;\n' +
    '}\n' +
    'this.' + fnName + ' = ' + fnName + ';\n';
};

exports.parse = function (str, line, parser, types, stack) {
  var name;

  parser.on(types.VAR, function (token) {
    if (token.match.indexOf('.') !== -1) {
      throw new Error('Unexpected dot in macro argument "' + token.match + '" on line ' + line + '.');
    }
    this.out.push(token.match);
  });

  parser.on(types.FUNCTION, function (token) {
    if (!name) {
      name = token.match;
      this.out.push(name);
      this.state.push(types.FUNCTION);
    }
  });

  parser.on(types.PARENCLOSE, function (token) {
    if (this.isLast) {
      return;
    }
    return true;
  });

  parser.on(types.COMMA, function (token) {
    return true;
  });

  parser.on('*', function (token) {
    return;
  });

  return true;
};

exports.ends = true;
