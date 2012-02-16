var parser  = require('../parser'),
    helpers = require('../helpers'),
    _ = require('underscore');

/**
 * set
 */
exports.set = function (indent, parentBlock) {
    var thisArgs = _.clone(this.args),
        varname = helpers.escapeVarName(thisArgs.shift(), '_context'),
        value;

    // remove '='
    if (thisArgs.shift() !== '=') {
        throw new Error('Invalid token "' + thisArgs[1] + '" in {% set ' + thisArgs[0] + ' %}. Missing "=".');
    }

    value = thisArgs[0];
    if ((/^\'|^\"|^\{|^\[/).test(value) || value === 'true' || value === 'false') {
        return ' ' + varname + ' = ' + value + ';';
    }

    value = parser.parseVariable(value);
    return ' ' + varname + ' = ' +
        '(function () {\n' +
        '    var _output = "";\n' +
        parser.compile.apply({ tokens: [value] }, [indent, parentBlock]) + '\n' +
        '    return _output;\n' +
        '})();\n';
};
