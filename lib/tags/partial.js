var parser  = require('../parser'),
    helpers = require('../helpers'),
    _ = require('underscore');

function generateOut (partialName, ctxPlain, ctxExec) {
    var includeContext = [];
    if (ctxPlain) {
        _.each(ctxPlain, function (ctxVal, ctxName) {
            includeContext.push('        ' + ctxName + ': "' + ctxVal + '"');
        })
    }
    if (ctxExec) {
        _.each(ctxExec, function (ctxFn, ctxName) {
            var fn = ctxFn.substring(0, ctxFn.length - 2);
            includeContext.push('        ' + ctxName + ': ' + fn);
        })
    }

    var ctx = '';
    if (includeContext.length) {
        ctx = '    var partialContext = {\n' + includeContext.join(',\n') + '\n};\n'
    } else {
        ctx = '    var partialContext = _context;\n';
    }

    var out = '(function () {\n' +
        helpers.setVar('__template', parser.parseVariable(partialName)) + '\n' +
        ctx;

    out += '    if (typeof __template === "string") {\n';
    out += '        _output += _this.compileFile(__template).render(partialContext, _parents);\n';
    out += '    }\n';

    out += '})();\n';

    return out;
}

var partial = function (indent, parentBlock, parser) {
    var partialName = this.args[0],
        contextPlain = {},
        contextExecutable = {};

    if (!helpers.isLiteral(partialName) && !helpers.isValidName(partialName)) {
        throw new Error('Invalid attempt to call partial "' + partialName  + '".');
    }

    _.chain(this.tokens)
        .filter(function (token) { return token.name == 'arg' })
        .each(function (token) {
            contextExecutable[token.args[0]] = token.compile(indent, this, parser);
        });

    var out = generateOut(partialName, contextPlain, contextExecutable);

    return out;
};

partial.ends = true;

module.exports = partial;