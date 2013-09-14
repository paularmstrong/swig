exports.parse = function (str, line, parser, types, options) {
  var matched = false;
  parser.on('*', function (token) {
    if (matched) {
      throw new Error('Unexpected token ' + token.match + '.');
    }
    matched = true;
    return true;
  });

  return true;
};

exports.compile = function (compiler, args, content, parents, options, blockName) {
  return '_output += _ext.url(' + args[0] + ');';
};

exports.ends = false;
exports.blockLevel = false;
