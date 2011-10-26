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

/**
* Includes another template. The included template will have access to the
* context, but won't have access to the variables defined in the parent template,
* like for loop counters.
*
* Usage:
*    {% include context_variable %}
* or
*    {% include 'template_name.html' %}
*/
exports.include = function (indent) {
    var template = this.args[0];

    indent = indent || '';

    if (!helpers.isLiteral(template) && !helpers.isValidName(template)) {
        throw new Error('Invalid arguments passed to \'include\' tag.');
    }

    // Circular includes are VERBOTTEN. This will crash the server.
    return [
        '(function () {',
        helpers.setVar('__template', parser.parseVariable(template)),
        '    if (typeof __template === "string") {',
        '        __output += __this.compileFile(__template).render(__context, __parents);',
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

exports['if'] = function (indent) {
    var args = (parseIfArgs(this.args)),
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
    out += parser.compile.call(this, indent + '    ');
    out += '\n}\n';
    out += '})();\n';

    return out;
};
exports['if'].ends = true;

exports['else'] = function (indent) {
    if (_.last(this.parent).name !== 'if') {
        throw new Error('Cannot call else tag outside of "if" context.');
    }

    var ifarg = this.args.shift(),
        args = (parseIfArgs(this.args)),
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
exports['for'] = function (indent) {
    var operand1 = this.args[0],
        operator = this.args[1],
        operand2 = parser.parseVariable(this.args[2]),
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

    loopShared = 'forloop.index = __forloopIndex;\n' +
        'forloop.first = (__forloopIndex === 0);\n' +
        'forloop.last = (__forloopIndex === __forloopLength - 1);\n' +
        operand1 + ' = __forloopIter[forloop.key];\n' +
        parser.compile.call(this, indent + '     ');

    out = '(function () {\n' +
        '    var ' + operand1 + ', forloop = {}, __forloopKey, __forloopIndex = 0, __forloopLength = 0;\n' +
        helpers.setVar('__forloopIter', operand2) +
        '    else {\n' +
        '        return;\n' +
        '    }\n' +
        // Basic for loops are MUCH faster than for...in. Prefer this arrays.
        '    if (_.isArray(__forloopIter)) {\n' +
        '        __forloopIndex = 0; __forloopLength = __forloopIter.length;\n' +
        '        for (; __forloopIndex < __forloopLength; __forloopIndex += 1) {\n' +
        '           forloop.key = __forloopIndex;\n' +
        loopShared +
        '        }\n' +
        '    } else if (typeof __forloopIter === "object") {\n' +
        '        __keys = _.keys(__forloopIter);\n' +
        '        __forloopLength = __keys.length;\n' +
        '        __forloopIndex = 0;\n' +
        '        for (; __forloopIndex < __forloopLength; __forloopIndex += 1) {\n' +
        '           forloop.key = __keys[__forloopIndex];\n' +
        loopShared +
        '        }\n' +
        '    }\n' +
        '})();\n';

    return out;
};
exports['for'].ends = true;

exports.empty = function (indent) {
    if (_.last(this.parent).name !== 'for') {
        throw new Error('Cannot call "empty" tag outside of "for" context.');
    }

    return '} if (_.keys(__forloopIter).length === 0) {\n';
};

/**
 * autoescape
 * Special handling hardcoded into the parser to determine whether variable output should be escaped or not
 */
exports.autoescape = function (indent) {
    return parser.compile.call(this, indent);
};
exports.autoescape.ends = true;

exports.set = function (indent) {
    var varname = this.args.shift(),
        value;

    // remove '='
    if (this.args.shift() !== '=') {
        throw new Error('Invalid token "' + this.args[1] + '" in {% set ' + this.args[0] + ' %}. Missing "=".');
    }

    value = this.args[0];
    if ((/^\'|^\"|^\{|^\[/).test(value)) {
        return 'var ' + varname + ' = ' + value + ';';
    }

    value = parser.parseVariable(value);
    return 'var ' + varname + ' = ' +
        '(function () {\n' +
        '    var __output = "";\n' +
        parser.compile.call({ tokens: [value] }, indent) + '\n' +
        ' return __output; })();\n';
};

exports['import'] = function (indent) {
    if (this.args.length !== 3) {
        throw new Error('Import statements require three arguments: {% import [template] as [context] %}.');
    }

    var file = this.args[0],
        as = this.args[1],
        name = this.args[2],
        out = '';

    if (!helpers.isLiteral(file) && !helpers.isValidName(file)) {
        throw new Error('Invalid attempt to import "' + file  + '".');
    }

    if (as !== 'as') {
        throw new Error('Invalid syntax {% import "' + file + '" ' + as + ' ' + name + ' %}');
    }

    out += '_.extend(__context, (function () {\n';

    out += 'var __context = {}, __ctx = {}, __output = "";\n' +
        helpers.setVar('__template', parser.parseVariable(file)) +
        '__this.compileFile(__template).render(__ctx, __parents);\n' +
        '_.each(__ctx, function (item, key) {\n' +
        '    if (typeof item === "function") {\n' +
        '        __context["' + name + '_" + key] = item;\n' +
        '    }\n' +
        '});\n' +
        'return __context;\n';

    out += '})());\n';

    return out;
};

exports.macro = function (indent) {
    var macro = this.args.shift(),
        args = '',
        out = '';

    if (this.args.length) {
        args = JSON.stringify(this.args).replace(/^\[|\'|\"|\]$/g, '');
    }

    out += '__context.' + macro + ' = function (' + args + ') {\n';
    out += '    var __output = "";\n';
    out += parser.compile.call(this, indent + '    ');
    out += '    return __output;\n';
    out += '};\n';

    return out;
};
exports.macro.ends = true;

exports.filter = function (indent) {
    var name = this.args.shift(),
        args = (this.args.length) ? this.args.join(', ') : '',
        value = '(function () {\n';
    value += '    var __output = "";\n';
    value += parser.compile.call(this, indent + '    ') + '\n';
    value += '    return __output;\n';
    value += '})()\n';

    return '__output += ' + helpers.wrapFilter(value.replace(/\n/g, ''), { name: name, args: args }) + ';\n';
};
exports.filter.ends = true;

