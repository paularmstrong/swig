var helpers = require('../helpers'),
    _ = require('underscore');

/**
* for
*/
module.exports = function (indent, parentBlock, parser) {
    var thisArgs = _.clone(this.args),
        operand1 = thisArgs[0],
        operator = thisArgs[1],
        operand2 = parser.parseVariable(thisArgs[2]),
        out = '',
        loopShared;

    indent = indent || '';

    if (typeof operator !== 'undefined' && operator !== 'in') {
        throw new Error('Invalid syntax in "for" tag');
    }

    if (!helpers.isValidShortName(operand1)) {
        throw new Error('Invalid arguments (' + operand1 + ') passed to "for" tag');
    }

    if (!helpers.isValidName(operand2.name)) {
        throw new Error('Invalid arguments (' + operand2.name + ') passed to "for" tag');
    }

    operand1 = helpers.escapeVarName(operand1);

    loopShared = 'loop.index = __loopIndex + 1;\n' +
        'loop.index0 = __loopIndex;\n' +
        'loop.revindex = __loopLength - loop.index0;\n' +
        'loop.revindex0 = loop.revindex - 1;\n' +
        'loop.first = (__loopIndex === 0);\n' +
        'loop.last = (__loopIndex === __loopLength - 1);\n' +
        '_context["' + operand1 + '"] = __loopIter[loop.key];\n' +
        parser.compile.apply(this, [indent + '     ', parentBlock]);

    out = '(function () {\n' +
        '    var loop = {}, __loopKey, __loopIndex = 0, __loopLength = 0,' +
        '        __ctx_operand = _context["' + operand1 + '"],\n' +
        '        __ctx_cycle = (typeof loop_cycle !== "undefined") ? loop_cycle : null,\n' +
        '        loop_cycle = function() {\n' +
        '            var args = _.toArray(arguments), i = loop.index0 % args.length;\n' +
        '            return args[i];\n' +
        '        };\n' +
        helpers.setVar('__loopIter', operand2) +
        '    else {\n' +
        '        return;\n' +
        '    }\n' +
        // Basic for loops are MUCH faster than for...in. Prefer this arrays.
        '    if (_.isArray(__loopIter)) {\n' +
        '        __loopIndex = 0; __loopLength = __loopIter.length;\n' +
        '        for (; __loopIndex < __loopLength; __loopIndex += 1) {\n' +
        '           loop.key = __loopIndex;\n' +
        loopShared +
        '        }\n' +
        '    } else if (typeof __loopIter === "object") {\n' +
        '        __keys = _.keys(__loopIter);\n' +
        '        __loopLength = __keys.length;\n' +
        '        __loopIndex = 0;\n' +
        '        for (; __loopIndex < __loopLength; __loopIndex += 1) {\n' +
        '           loop.key = __keys[__loopIndex];\n' +
        loopShared +
        '        }\n' +
        '    }\n' +
        '    loop_cycle = __ctx_cycle;\n' +
        '    _context["' + operand1 + '"] = __ctx_operand;\n' +
        '})();\n';

    return out;
};
module.exports.ends = true;
