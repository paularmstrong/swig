var utils = require('../utils');

exports.compile = function (compiler, args, content, parent, options) {
  function stripWhitespace(tokens) {
    return utils.map(tokens, function (token) {
      if (token.content) {
        token.content = stripWhitespace(token.content);
        return token;
      }

      return token.replace(/^\s+/, '')
        .replace(/>\s+</g, '><')
        .replace(/\s+$/, '');
    });
  }

  return compiler(stripWhitespace(content), parent, options);
};

exports.parse = function (str, line, parser, types) {
  parser.on('*', function (token) {
    throw new Error('Unexpected token "' + token.match + '" on line ' + line + '.');
  });

  return true;
};

exports.ends = true;
