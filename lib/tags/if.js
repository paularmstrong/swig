exports.compile = function (compiler, setup, args, content, teardown) {
  return [
    setup,
    'if (' + args + ') {',
    compiler(content),
    '}',
    teardown
  ].join('\n');
};

exports.parse = function (str, line, parser, types) {
  parser.on(types.COMPARATOR, function (token) {
    this.out.push(token.match);
  });
  parser.on(types.VAR, function (token) {
    this.out.push(token.match);
  });
};

exports.ends = true;
