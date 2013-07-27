exports.compile = function (compiler, args, content) {
  var last = args[args.length - 1];
  return [
    '(function () {\n',
    '  var loop = { index: 1, index0: 0, revIndex: ' + last + '.length, revIndex0: ' + last + '.length - 1 };\n',
    '  _.each(' + args[args.length - 1] + ', function (' + args[0] + ', k) {\n',
    '    loop.index += 1; loop.index0 += 1; loop.revIndex -= 1; loop.revIndex0 -= 1;\n',
    '    ' + compiler(content),
    '  });\n',
    '})();\n'
  ].join('');
};

exports.parse = function (str, line, parser, types, stack) {
  var firstVar;
  parser.on(types.VAR, function (token) {
    if (!this.out.length) {
      firstVar = true;
    }
    this.out.push(token.match);
    // return true;
  });

  parser.on(types.COMMA, function (token) {
    if (firstVar && this.prevToken === types.VAR) {
      // TODO
      return;
    }

    return true;
  });

  return true;
};

exports.ends = true;
