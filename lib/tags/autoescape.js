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
 * @param {boolean} control One of `true` or `false`.
 */
exports.compile = function (compiler, args, content) {
  return compiler(content);
};
exports.parse = function (str, line, parser, types, stack) {
  parser.on('*', function (token) {
    if (token.match !== 'true' && token.match !== 'false') {
      throw new Error('Unexpected token "' + token.match + '" in autoescape tag on line ' + line + '.');
    }
    this.out.push(token.match);
  });
  return true;
};
exports.ends = true;
