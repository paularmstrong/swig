exports.compile = function (compiler, args, content, parent, options) {
  return compiler(content, parent, options, args.join(''));
};

exports.parse = function (str, line, parser, types) {
  parser.on('*', function (token) {
    this.out.push(token.match);
  });
  return true;
};

exports.ends = true;
