// Magic tag, hardcoded into parser
exports.compile = function (compiler, args, content) {
  return compiler(content);
};
exports.parse = function (str, line, parser, types, stack) {
  parser.on('*', function (token) {
    throw new Error('Unexpected token "' + token.match + '" in raw tag on line ' + line + '.');
  });
  return true;
};
exports.ends = true;
