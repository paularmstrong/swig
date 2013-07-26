exports.compile = function (compiler, args, content) {
  return '} else {\n';
};

exports.parse = function (str, line, parser, types, stack) {
  parser.on('*', function (token) {
    throw new Error('"else" tag does not accept any tokens. Found "' + token.match + '" on line ' + line + '.');
  });

  return (stack.length && stack[stack.length - 1].name === 'if');
};
