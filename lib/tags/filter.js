var helpers = require('../helpers'),
    _ = require('underscore');

/**
 * filter
 */
module.exports = function (indent, parentBlock, parser) {
    var thisArgs = _.clone(this.args),
        name = thisArgs.shift(),
        args = (thisArgs.length) ? thisArgs.join(', ') : '',
        value = '(function () {\n';
    value += '    var _output = "";\n';
    value += parser.compile.apply(this, [indent + '    ', parentBlock]) + '\n';
    value += '    return _output;\n';
    value += '})()\n';

    return '_output += ' + helpers.wrapFilter(value.replace(/\n/g, ''), { name: name, args: args }) + ';\n';
};
module.exports.ends = true;
