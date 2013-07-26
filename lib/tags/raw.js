// Magic tag, hardcoded into parser
exports.compile = function (compiler, args, content) {
  return compiler(content);
};
exports.parse = function (str, line, parser, types, stack) {
  parser.on('*', function (token) {
    if (token.match !== 'true' && token.match !== 'false') {
      throw new Error('Unexpected token "' + token.match + '" in raw tag on line ' + line + '.');
    }
    this.out.push(token.match);
  });
  return true;
};
exports.ends = true;
