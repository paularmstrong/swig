var _ = require('underscore');

/**
 * macro
 */
module.exports = function (indent, parentBlock, parser) {
    var thisArgs = _.clone(this.args),
        macro = thisArgs.shift(),
        args = '',
        out = '';

    if (thisArgs.length) {
        args = JSON.stringify(thisArgs).replace(/^\[|\'|\"|\]$/g, '');
    }

    out += '_context.' + macro + ' = function (' + args + ') {\n';
    out += '    var _output = "";\n';
    out += parser.compile.apply(this, [indent + '    ', parentBlock]);
    out += '    return _output;\n';
    out += '};\n';

    return out;
};
module.exports.ends = true;
