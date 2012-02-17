var parser  = require('./parser'),
    helpers = require('./helpers'),
    filters = require('./filters'),
    _ = require('underscore');

/**
* Inheritance inspired by Django templates
* The 'extends' and 'block' logic is hardwired in parser.compile
* These are dummy tags.
*/
exports['extends'] = {};
exports.block = { ends: true };
exports.parent = {};
exports.raw = { ends: true };

/**
* Includes another template. The included template will have access to the
* context, but won't have access to the variables defined in the parent template,
* like for loop counters.
*
* Usage:
*    {% include context_variable %}
* or
*    {% include 'template_name.html' %}
* or
*    {% include 'template-name' with <variable(s)...> [only] %}
* or
*    {% include 'template-name' using <context> %}
*/
exports.include = function (indent) {
    var args = _.clone(this.args),
        template = args.shift(),
        context = '_context';

    indent = indent || '';

    if (!helpers.isLiteral(template) && !helpers.isValidName(template)) {
        throw new Error('Invalid arguments passed to \'include\' tag.');
    }

    if (args.length) {
        if (_.last(args) === 'only') {
            context = '{}';
            args.pop();
        }

        if (args.length && args[0] !== 'with' && args[0] !== 'using') {
            throw new Error('Invalid arguments passed to \'include\' tag.');
        }

        if (args[0] === 'with') {
            args.shift();
            if (!args.length) {
                throw new Error('Context for \'include\' tag not provided, but expected after \'with\' token.');
            }

            context = '_.extend(' + context + ', { ';
            _.each(args, function (value, key) {
                context += '"' + value + '": _context["' + value + '"] || ' + value + ',';
            });
            context += ' })';
        } else if (args[0] === 'using') {
            args.shift();
            if (!args.length) {
                throw new Error('Context for \'include\' tag not provided, but expected after \'with\' token.');
            }

            if (args.length > 1) {
                throw new Error('\'include\' with \'using\' can only have a single context');
            }

            context = '_context["' + args[0] + '"] || ' + args[0];
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

function parseIfArgs(args) {
    var operators = ['==', '<', '>', '!=', '<=', '>=', '===', '!==', '&&', '||', 'in', 'and', 'or'],
        errorString = 'Bad if-syntax in `{% if ' + args.join(' ') + ' %}...',
        tokens = [],
        prevType,
        last,
        closing = 0;

    _.each(args, function (value, index) {
        var endsep = false,
            operand;

        if ((/^\(/).test(value)) {
            closing += 1;
            value = value.substr(1);
            tokens.push({ type: 'separator', value: '(' });
        }

        if ((/^\![^=]/).test(value) || (value === 'not')) {
            if (value === 'not') {
                value = '';
            } else {
                value = value.substr(1);
            }
            tokens.push({ type: 'operator', value: '!' });
        }

        if ((/\)$/).test(value)) {
            if (!closing) {
                throw new Error(errorString);
            }
            value = value.replace(/\)$/, '');
            endsep = true;
            closing -= 1;
        }

        if (value === 'in') {
            last = tokens.pop();
            prevType = 'inindex';
        } else if (_.indexOf(operators, value) !== -1) {
            if (prevType === 'operator') {
                throw new Error(errorString);
            }
            value = value.replace('and', '&&').replace('or', '||');
            tokens.push({
                value: value
            });
            prevType = 'operator';
        } else if (value !== '') {
            if (prevType === 'value') {
                throw new Error(errorString);
            }
            operand = parser.parseVariable(value);

            if (prevType === 'inindex') {
                tokens.push({
                    preout: last.preout + helpers.setVar('__op' + index, operand),
                    value: '(((_.isArray(__op' + index + ') || typeof __op' + index + ' === "string") && _.indexOf(__op' + index + ', ' + last.value + ') !== -1) || (typeof __op' + index + ' === "object" && ' + last.value + ' in __op' + index + '))'
                });
                last = null;
            } else {
                tokens.push({
                    preout: helpers.setVar('__op' + index, operand),
                    value: '__op' + index
                });
            }
            prevType = 'value';
        }

        if (endsep) {
            tokens.push({ type: 'separator', value: ')' });
        }
    });

    if (closing > 0) {
        throw new Error(errorString);
    }

    return tokens;
}

exports['if'] = function (indent, parentBlock) {
    var thisArgs = _.clone(this.args),
        args = (parseIfArgs(thisArgs)),
        out = '(function () {\n';

    _.each(args, function (token) {
        if (token.hasOwnProperty('preout') && token.preout) {
            out += token.preout + '\n';
        }
    });

    out += '\nif (\n';
    _.each(args, function (token) {
        out += token.value + ' ';
    });
    out += ') {\n';
    out += parser.compile.apply(this, [indent + '    ', parentBlock]);
    out += '\n}\n';
    out += '})();\n';

    return out;
};
exports['if'].ends = true;

exports['else'] = function (indent, parentBlock) {
    var last = _.last(this.parent).name,
        thisArgs = _.clone(this.args),
        ifarg,
        args,
        out;

    if (last === 'for') {
        if (thisArgs.length) {
            throw new Error('"else" tag cannot accept arguments in the "for" context.');
        }
        return '} if (__loopLength === 0) {\n';
    }

    if (last !== 'if') {
        throw new Error('Cannot call else tag outside of "if" or "for" context.');
    }

    ifarg = thisArgs.shift();
    args = (parseIfArgs(thisArgs));
    out = '';

    if (ifarg) {
        out += '} else if (\n';
        out += '    (function () {\n';

        _.each(args, function (token) {
            if (token.hasOwnProperty('preout') && token.preout) {
                out += token.preout + '\n';
            }
        });

        out += 'return (\n';
        _.each(args, function (token) {
            out += token.value + ' ';
        });
        out += ');\n';

        out += '    })()\n';
        out += ') {\n';

        return out;
    }

    return indent + '\n} else {\n';
};

/**
* This is the 'for' tag compiler
* Example 'For' tag syntax:
*  {% for x in y.some.items %}
*    <p>{{x}}</p>
*  {% endfor %}
*/
exports['for'] = function (indent, parentBlock) {
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
        '        __ctx_cycle = _context.loop_cycle;\n' +
        '_context.loop_cycle = function() {\n' +
        '    var args = _.toArray(arguments), i = loop.index0 % args.length;\n' +
        '    return args[i];\n' +
        '};\n' +
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
        '    _context.loop_cycle = __ctx_cycle;\n' +
        '    _context["' + operand1 + '"] = __ctx_operand;\n' +
        '})();\n';

    return out;
};
exports['for'].ends = true;

/**
 * autoescape
 * Special handling hardcoded into the parser to determine whether variable output should be escaped or not
 */
exports.autoescape = function (indent, parentBlock) {
    return parser.compile.apply(this, [indent, parentBlock]);
};
exports.autoescape.ends = true;

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

exports['import'] = function (indent) {
    if (this.args.length !== 3) {
        throw new Error('Import statements require three arguments: {% import [template] as [context] %}.');
    }

    var thisArgs = _.clone(this.args),
        file = thisArgs[0],
        as = thisArgs[1],
        name = thisArgs[2],
        out = '';

    if (!helpers.isLiteral(file) && !helpers.isValidName(file)) {
        throw new Error('Invalid attempt to import "' + file  + '".');
    }

    if (as !== 'as') {
        throw new Error('Invalid syntax {% import "' + file + '" ' + as + ' ' + name + ' %}');
    }

    out += '_.extend(_context, (function () {\n';

    out += 'var _context = {}, __ctx = {}, _output = "";\n' +
        helpers.setVar('__template', parser.parseVariable(file)) +
        '_this.compileFile(__template).render(__ctx, _parents);\n' +
        '_.each(__ctx, function (item, key) {\n' +
        '    if (typeof item === "function") {\n' +
        '        _context["' + name + '_" + key] = item;\n' +
        '    }\n' +
        '});\n' +
        'return _context;\n';

    out += '})());\n';

    return out;
};

exports.macro = function (indent, parentBlock) {
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
exports.macro.ends = true;

exports.filter = function (indent, parentBlock) {
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
exports.filter.ends = true;
