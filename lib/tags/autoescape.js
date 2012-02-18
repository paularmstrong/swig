/**
 * autoescape
 * Special handling hardcoded into the parser to determine whether variable output should be escaped or not
 */
module.exports = function (indent, parentBlock, parser) {
    return parser.compile.apply(this, [indent, parentBlock]);
};
module.exports.ends = true;
