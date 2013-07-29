exports.compile = function (compiler, args, content, parent, options, blockName) {
  if (!parent || !parent.blocks || !parent.blocks.hasOwnProperty(blockName)) {
    return '';
  }

  var block = parent.blocks[blockName];
  return block.compile(compiler, [], block.content, null, options) + '\n';
};

exports.parse = function (str, line, parser, types) {
  parser.on('*', function (token) {
    throw new Error('Unexpected argument "' + token.match + '" on line ' + line + '.');
  });
  return true;
};
