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
    return ['(function () {'
    , ' if (' + helpers.check(template) + ') {'
    , '   var __template = ' + helpers.escape(template) + ';'
    , ' }'
    , ' else if (' + helpers.check(template, '__context') + ') {'
    , '   var __template = ' + helpers.escape(template, '__context') + ';'
    , ' }'
    , ' if (typeof __template === "string") {'
    , '   __output.push(__this.fromFile(__template).render(__context, __parents));'
    , ' }'
    , ' else if (typeof __template === "object" && __template.render) {'
    , '   __output.push(__template.render(__context, __parents));'
    , ' }'
    , '})();'].join('\n' + indent);
};

function checkIfArgs(leftOperand, operator, rightOperand) {
    var negation = false;

    // Check if there is negation
    if (leftOperand.name[0] === '!') {
        negation = true;
        leftOperand.name = leftOperand.name.substr(1);
    }

    // '!something == else' - this syntax is forbidden. Use 'something != else' instead
    if (negation && operator) {
        throw new Error('Invalid syntax for "if" tag');
    }
    // Check for valid argument
    if (!helpers.isLiteral(leftOperand.name) && !helpers.isValidName(leftOperand.name)) {
        throw new Error('Invalid arguments (' + leftOperand.name + ') passed to "if" tag');
    }
    // Check for valid operator
    if (operator && ['==', '<', '>', '!=', '<=', '>=', '===', '!==', 'in'].indexOf(operator) === -1) {
        throw new Error('Invalid operator (' + operator + ') passed to "if" tag');
    }
    // Check for presence of operand 2 if operator is present
    if (operator && !rightOperand) {
        throw new Error('Missing argument in "if" tag');
    }

    // Check for valid argument
    if (operator && !helpers.isLiteral(rightOperand.name) && !helpers.isValidName(rightOperand.name)) {
        throw new Error('Invalid arguments (' + rightOperand.name + ') passed to "if" tag');
    }

    return negation;
}

exports['if'] = function (indent) {
    var leftOperand = parser.parseVariable(this.args[0]),
        operator = this.args[1],
        rightOperand = parser.parseVariable(this.args[2]),
        negation = checkIfArgs(leftOperand, operator, rightOperand),
        out;

    indent = indent || '';

    out = ['(function () {'];
    out.push(helpers.setVar('__op1', leftOperand));
    if (rightOperand.name === '') {
        out.push(' if (' + (negation ? '!' : '!!') + '__op1) {');
        out.push(parser.compile.call(this, indent + '   '));
        out.push(' }');
    } else {
        out.push(helpers.setVar('__op2', rightOperand));

        if (typeof operator !== 'undefined') {
            if (operator === 'in') {
                out.push('if (');
                out.push('    (Array.isArray(__op2) && __op2.indexOf(__op1) > -1) ||');
                out.push('    (typeof __op2 === "string" && __op2.indexOf(__op1) > -1) ||');
                out.push('    (!Array.isArray(__op2) && typeof __op2 === "object" && __op1 in __op2)');
                out.push(') {');
                out.push(parser.compile.call(this, indent + '    '));
                out.push('}');
            } else {
                out.push('if (__op1 ' + helpers.escape(operator) + ' __op2) {');
                out.push(parser.compile.call(this, indent + '    '));
                out.push('}');
            }
        }
    }
    out.push('})();');
    return out.join('\n' + indent);
};
exports['if'].ends = true;

exports.else = function (indent) {
    if (_.last(this.parent).name !== 'if') {
        throw new Error('Cannot call else tag outside of "if" context.');
    }

    var ifarg = this.args.shift(),
        leftOperand, operator, rightOperand, negation, out;

    if (ifarg) {
        leftOperand = parser.parseVariable(this.args[0]);
        operator = this.args[1];
        rightOperand = parser.parseVariable(this.args[2]);
        negation = checkIfArgs(leftOperand, operator, rightOperand);
        out = [];

        if (rightOperand.name === '') {
            out.push('} else if (' + (negation ? '!' : '!!') + '(function() {' + helpers.setVar('__op1', leftOperand) + ' return __op1; })()) {');
        } else {
            out.push(helpers.setVar('__op2', rightOperand));

            if (operator) {
                if (operator === 'in') {
                    out.push('} else if (');
                    out.push('    (function() {');
                    out.push('        ' + helpers.setVar('__op1', leftOperand));
                    out.push('        ' + helpers.setVar('__op2', rightOperand));
                    out.push('        return (Array.isArray(__op2) && __op2.indexOf(__op1) > -1) ||');
                    out.push('        (typeof __op2 === "string" && __op2.indexOf(__op1) > -1) ||');
                    out.push('        (!Array.isArray(__op2) && typeof __op2 === "object" && __op1 in __op2);');
                    out.push('    })()');
                    out.push(') {');
                } else {
                    out.push('} else if (');
                    out.push('    (function() {');
                    out.push('       ' + helpers.setVar('__op1', leftOperand));
                    out.push('        ' + helpers.setVar('__op2', rightOperand));
                    out.push('        return __op1 ' + helpers.escape(operator) + ' __op2;');
                    out.push('    })()');
                    out.push(') {');
                }
            }
        }

        return out.join('\n', indent);
    }

    return indent + '} else {';
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

    return ['(function () {'
    , ' var ' + helpers.escape(operand1) + ','
    , '     forloop = {};'
    , helpers.setVar('__forloopIter', operand2)
    , ' else {'
    , '     return;'
    , ' }'
    , ' if (Array.isArray(__forloopIter)) {'
    , '     var __forloopIndex = 0, __forloopLength = __forloopIter.length;'
    , '     for (; __forloopIndex < __forloopLength; __forloopIndex += 1) {'
    , '         forloop.index = __forloopIndex;'
    , '         forloop.key = __forloopIndex;'
    , '         forloop.first = (__forloopIndex === 0);'
    , '         forloop.last = (__forloopIndex === __forloopLength - 1);'
    , '         ' + helpers.escape(operand1) + ' = __forloopIter[__forloopIndex];'
    , '         ' + parser.compile.call(this, indent + '     ')
    , '     }'
    , ' } else if (typeof __forloopIter === "object") {'
    , '     var __forloopKey, __forloopLength = Object.keys(__forloopIter).length, __forloopIndex = 0;'
    , '     for (__forloopKey in __forloopIter) {'
    , '         if (!__forloopIter.hasOwnProperty(__forloopKey)) {'
    , '             continue;'
    , '         }'
    , '         forloop.index = __forloopIndex;'
    , '         forloop.key = __forloopKey;'
    , '         forloop.first = (__forloopIndex === 0);'
    , '         forloop.last = (__forloopIndex === __forloopLength - 1);'
    , '         ' + helpers.escape(operand1) + ' = __forloopIter[__forloopKey];'
    , '         ' + parser.compile.call(this, indent + '     ')
    , '         __forloopIndex += 1;'
    , '     }'
    , ' }'
    , '})();'].join('\n' + indent);
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
    return 'var ' + varname + ' = (function () { var __output = []; ' + parser.compile.call({ tokens: [value] }, indent) + ' return __output.join(""); })();';
};

exports.macro = function (indent) {
    var macro = this.args.shift(),
        args = '',
        out = [];

    if (this.args.length) {
        args = JSON.stringify(this.args).replace(/^\[|\'|\"|\]$/g, '');
    }

    out.push('var ' + macro + ' = function (' + args + ') {');
    out.push('    var __output = [];');
    out.push(parser.compile.call(this, indent + '    '));
    out.push('    return __output.join("")');
    out.push('};');

    return out.join('\n' + indent);
};
exports.macro.ends = true;
