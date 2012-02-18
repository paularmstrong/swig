var helpers = require('../helpers'),
    _ = require('underscore');

/**
 * include
 */
module.exports = function (indent, parentBlock, parser) {
    var args = _.clone(this.args),
        template = args.shift(),
        context = '_context',
        ctx;

    indent = indent || '';

    if (!helpers.isLiteral(template) && !helpers.isValidName(template)) {
        throw new Error('Invalid arguments passed to \'include\' tag.');
    }

    if (args.length) {
        if (_.last(args) === 'only') {
            context = '{}';
            args.pop();
        }

        if (args.length && args[0] !== 'with') {
            throw new Error('Invalid arguments passed to \'include\' tag.');
        }

        if (args[0] === 'with') {
            args.shift();
            if (!args.length) {
                throw new Error('Context for \'include\' tag not provided, but expected after \'with\' token.');
            }

            ctx = args.shift();

            context = '_context["' + ctx + '"] || ' + ctx;
        }
    }


    // Circular includes are VERBOTTEN. This will crash the server.
    return [
        '(function () {',
        helpers.setVar('__template', parser.parseVariable(template)),
        '    var includeContext = ' + context + ';',
        '    if (typeof __template === "string") {',
        '        _output += _this.compileFile(__template).render(includeContext, _parents);',
        '    }',
        '})();'
    ].join('\n' + indent);
};
