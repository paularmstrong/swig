var bools = ['false', 'true'],
  strings = ['html', 'js'];

/**
 * Control auto-escaping of variable output from within your templates.
 *
 * @alias autoescape
 *
 * @example
 * // myvar = '<foo>';
 * {% autoescape true %}{{ myvar }}{% endautoescape %}
 * // => &lt;foo&gt;
 * {% autoescape false %}{{ myvar }}{% endautoescape %}
 * // => <foo>
 *
 * @param {boolean|string} control One of `true`, `false`, `"js"` or `"html"`.
 */
exports.compile = function (compiler, args, content) {
  return compiler(content);
};
exports.parse = function (str, line, parser, types, stack) {
  var matched;
  parser.on('*', function (token) {
    if (token.type === types.WHITESPACE) {
      return;
    }
    if (!matched &&
        (token.type === types.BOOL ||
          (token.type === types.STRING && strings.indexOf(token.match) === -1))
        ) {
      this.out.push(token.match);
      matched = true;
      return;
    }
    throw new Error('Unexpected token "' + token.match + '" in autoescape tag on line ' + line + '.');
  });

  return true;
};
exports.ends = true;
