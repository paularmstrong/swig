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
    if (this.isLast) {
      throw new Error('Unexpected logic "' + token.match + '" on line ' + line + '.');
    }
    if (this.prevToken.type === types.NOT) {
      throw new Error('Attempted logic "not ' + token.match + '" on line ' + line + '. Use !(foo ' + token.match + ') instead.');
    }
    this.out.push(token.match);
  });
  parser.on(types.VAR, function (token) {
    this.out.push(token.match);
  });
  parser.on(types.NOT, function (token) {
    if (this.isLast) {
      throw new Error('Unexpected logic "' + token.match + '" on line ' + line + '.');
    }
    this.out.push(token.match);
  });
  parser.on(types.BOOL, function (token) {
    this.out.push(token.match);
  });
  parser.on(types.LOGIC, function (token) {
    if (!this.out.length || this.isLast) {
      throw new Error('Unexpected logic "' + token.match + '" on line ' + line + '.');
    }
    this.out.push(token.match);
  });
};

exports.ends = true;
