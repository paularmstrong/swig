exports.compile = function (compiler, args, content) {
  var val = args.shift(),
    key = '__k',
    last;

  if (args[0] && args[0] === ',') {
    args.shift();
    key = args.shift();
  }

  last = args.join('');

  return [
    '(function () {\n',
    '  var __l = ' + last + ';\n',
    '  if (!__l) { return; }\n',
    '  var loop = { first: false, index: 1, index0: 0, revindex: __l.length, revindex0: __l.length - 1, length: __l.length, last: false };\n',
    '  utils.each(__l, function (' + val + ', ' + key + ') {\n',
    '    loop.key = ' + key + ';\n',
    '    loop.first = (loop.index0 === 0);\n',
    '    loop.last = (loop.revindex0 === 0);\n',
    '    ' + compiler(content),
    '    loop.index += 1; loop.index0 += 1; loop.revindex -= 1; loop.revindex0 -= 1;\n',
    '  });\n',
    '})();\n'
  ].join('');
};

exports.parse = function (str, line, parser, types, stack) {
  var firstVar, comma, ready;

  parser.on(types.NUMBER, function (token) {
    throw new Error('Unexpected number "' + token.match + '" on line ' + line + '.');
  });

  parser.on(types.VAR, function (token) {
    if (ready && firstVar) {
      return true;
    }

    if (!this.out.length) {
      firstVar = true;
    }

    this.out.push(token.match);
  });

  parser.on(types.COMMA, function (token) {
    if (firstVar && this.prevToken.type === types.VAR) {
      this.out.push(token.match);
      return;
    }

    return true;
  });

  parser.on(types.COMPARATOR, function (token) {
    if (token.match !== 'in' || !firstVar) {
      throw new Error('Unexpected token "' + token.match + '" on line ' + line + '.');
    }
    ready = true;
  });

  return true;
};

exports.ends = true;
