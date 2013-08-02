var utils = require('../utils');

exports.compile = function (compiler, args, content, parent, options) {
  function stripWhitespace(tokens) {
    return utils.map(tokens, function (token) {
      if (token.content && token.content.tokens) {
        token.content.tokens = stripWhitespace(token.content.tokens);
        return token;
      }

      if (typeof token !== 'string') {
        return token;
      }

      return token.replace(/^\s+/, '')
        .replace(/>\s+</g, '><')
        .replace(/\s+$/, '');
    });
  }
  content.tokens = stripWhitespace(content.tokens);

  return compiler(content, parent, options);
};

exports.parse = function (str, line, parser, types) {
  parser.on('*', function (token) {
    throw new Error('Unexpected token "' + token.match + '" on line ' + line + '.');
  });

  return true;
};

exports.ends = true;
