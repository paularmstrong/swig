var parser  = require('../parser');

/**
 * autoescape
 * Special handling hardcoded into the parser to determine whether variable output should be escaped or not
 */
exports.autoescape = function (indent, parentBlock) {
    return parser.compile.apply(this, [indent, parentBlock]);
};
exports.autoescape.ends = true;
