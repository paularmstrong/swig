var parser  = require('./parser'),
    helpers = require('./helpers'),
    _ = require('underscore');

/**
* Inheritance inspired by Django templates
* The 'extends' and 'block' logic is hardwired in parser.compile
* These are dummy tags.
*/
exports.extends = {};
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
        ' if (typeof __template === "string") {',
        '   __output += __this.fromFile(__template).render(__context, __parents);',
        ' }',
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
                    value: '(((_.isArray(__op' + index + ') || typeof __op' + index + ' === "string") && __op' + index + '.indexOf(' + last.value + ') !== -1) || (typeof __op' + index + ' === "object" && ' + last.value + ' in __op' + index + '))'
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
            out += token.preout;
        }
    });

    out += '\n\nif (';
    _.each(args, function (token) {
        out += token.value + ' ';
    });
    out += ') {\n';
    out += parser.compile.call(this, indent + '    ');
    out += '\n}\n';
    out += '})();';

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
        out += '} else if (';
        out += '    (function () {';

        _.each(args, function (token) {
            if (token.hasOwnProperty('preout') && token.preout) {
                out += token.preout;
            }
        });

        out += 'return (';
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
        operand2 = parser.parseVariable(this.args[2]);

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

    return [
        '(function () {',
        ' var ' + helpers.escapeVarName(operand1) + ',',
        '     forloop = {};',
        helpers.setVar('__forloopIter', operand2),
        ' else {',
        '     return;',
        ' }',
        ' if (_.isArray(__forloopIter)) {',
        '     var __forloopIndex = 0, __forloopLength = __forloopIter.length;',
        '     for (; __forloopIndex < __forloopLength; __forloopIndex += 1) {',
        '         forloop.index = __forloopIndex;',
        '         forloop.key = __forloopIndex;',
        '         forloop.first = (__forloopIndex === 0);',
        '         forloop.last = (__forloopIndex === __forloopLength - 1);',
        '         ' + helpers.escapeVarName(operand1) + ' = __forloopIter[__forloopIndex];',
        '         ' + parser.compile.call(this, indent + '     '),
        '     }',
        ' } else if (typeof __forloopIter === "object") {',
        '     var __forloopKey, __forloopLength = Object.keys(__forloopIter).length, __forloopIndex = 0;',
        '     for (__forloopKey in __forloopIter) {',
        '         if (!__forloopIter.hasOwnProperty(__forloopKey)) {',
        '             continue;',
        '         }',
        '         forloop.index = __forloopIndex;',
        '         forloop.key = __forloopKey;',
        '         forloop.first = (__forloopIndex === 0);',
        '         forloop.last = (__forloopIndex === __forloopLength - 1);',
        '         ' + helpers.escapeVarName(operand1) + ' = __forloopIter[__forloopKey];',
        '         ' + parser.compile.call(this, indent + '     '),
        '         __forloopIndex += 1;',
        '     }',
        ' }',
        '})();'
    ].join('\n' + indent);
};
exports['for'].ends = true;

exports.empty = function (indent) {
    if (_.last(this.parent).name !== 'for') {
        throw new Error('Cannot call "empty" tag outside of "for" context.');
    }

    return '} if (Object.keys(__forloopIter).length === 0) {';
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

    if (this.args.length > 1) {
        try {
            value = JSON.stringify(JSON.parse(this.args.join('')));
        } catch (e) {
            value = this.args.join('');
        }

        return 'var ' + varname + ' = ' + value + ';';
    }

    value = parser.parseVariable(this.args[0]);
    return 'var ' + varname + ' = (function () { var __output = ""; ' + parser.compile.call({ tokens: [value] }, indent) + ' return __output; })();';
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

    out += '_.extend(__context, (function () {';

    out += 'var __context = {}, __ctx = {}, __output = "";' +
        helpers.setVar('__template', parser.parseVariable(file)) +
        '__this.fromFile(__template).render(__ctx, __parents);' +
        '_.each(__ctx, function (item, key) {' +
        '    if (typeof item === "function") {' +
        '        __context["' + name + '_" + key] = item;' +
        '    }' +
        '});' +
        'return __context;';

    out += '})());';

    return out;
};

exports.macro = function (indent) {
    var macro = this.args.shift(),
        args = '',
        out = '';

    if (this.args.length) {
        args = JSON.stringify(this.args).replace(/^\[|\'|\"|\]$/g, '');
    }

    out += '__context.' + macro + ' = function (' + args + ') {';
    out += '    var __output = "";';
    out += parser.compile.call(this, indent + '    ');
    out += '    return __output;';
    out += '};';

    return out;
};
exports.macro.ends = true;
