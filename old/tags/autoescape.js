/**
 * autoescape
 * Special handling hardcoded into the parser to determine whether variable output should be escaped or not
 */
module.exports = function (indent, parser) {
  return parser.compile.apply(this, [indent]);
};
module.exports.ends = true;
