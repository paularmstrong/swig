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


/**
* This is the 'if' tag compiler
* Example 'If' tag syntax:
*  {% if x %}
*    <p>{{x}}</p>
*  {% endif %}
*
*  {% if !x %}
*    <p>No x found</p>
*  {% else %}
*    <p>{{x}}</p>
*  {% endif %}
*
*  {% if x == y %}, {% if x < y %}, {% if x in y %}, {% if x != y %}
*/
exports['if'] = function (indent) {
    var operand1 = this.args[0],
        operator = this.args[1],
        operand2 = this.args[2],
        negation = false,
        out;

    indent = indent || '';

    // Check if there is negation
    if (operand1[0] === '!') {
        negation = true;
        operand1 = operand1.substr(1);
    }
    // '!something == else' - this syntax is forbidden. Use 'something != else' instead
    if (negation && operator) {
        throw new Error('Invalid syntax for "if" tag');
    }
    // Check for valid argument
    operand1 = parser.parseVariable(operand1);
    if (!helpers.isLiteral(operand1.name) && !helpers.isValidName(operand1.name)) {
        throw new Error('Invalid arguments (' + operand1.name + ') passed to "if" tag');
    }
    // Check for valid operator
    if (operator && ['==', '<', '>', '!=', '<=', '>=', '===', '!==', 'in'].indexOf(operator) === -1) {
        throw new Error('Invalid operator (' + operator + ') passed to "if" tag');
    }
    // Check for presence of operand 2 if operator is present
    if (operator && typeof operand2 === 'undefined') {
        throw new Error('Missing argument in "if" tag');
    }

    // Check for valid argument
    operand2 = parser.parseVariable(operand2);
    if (operator && !helpers.isLiteral(operand2.name) && !helpers.isValidName(operand2.name)) {
        throw new Error('Invalid arguments (' + operand2.name + ') passed to "if" tag');
    }

    out = ['(function () {'];
    out.push(helpers.setVar('__op1', operand1));
    if (operand2.name === '') {
        out.push(' if (' + (negation ? '!' : '!!') + '__op1) {');
        out.push(parser.compile.call(this, indent + '   '));
        out.push(' }');
    } else {
        out.push(helpers.setVar('__op2', operand2));

        if (typeof operator !== 'undefined') {
            if (operator === 'in') {
                out.push(' if (');
                out.push('    (Array.isArray(__op2) && __op2.indexOf(__op1) > -1) ||');
                out.push('    (typeof __op2 === "string" && __op2.indexOf(__op1) > -1) ||');
                out.push('    (!Array.isArray(__op2) && typeof __op2 === "object" && __op1 in __op2)');
                out.push(' ) {');
                out.push(parser.compile.call(this, indent + '    '));
                out.push(' }');
            } else {
                out.push(' if (__op1 ' + helpers.escape(operator) + ' __op2) {');
                out.push(parser.compile.call(this, indent + '    '));
                out.push(' }');
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
    , '     for (; __forloopIndex < __forloopLength; ++__forloopIndex) {'
    , '         forloop.index = __forloopIndex;'
    , '         ' + helpers.escape(operand1) + ' = __forloopIter[__forloopIndex];'
    ,           parser.compile.call(this, indent + '     ')
    , '     }'
    , ' } else if (typeof __forloopIter === "object") {'
    , '     var __forloopIndex;'
    , '     for (__forloopIndex in __forloopIter) {'
    , '         if (__forloopIter.hasOwnProperty(__forloopIndex)) {'
    , '             forloop.index = __forloopIndex;'
    , '             ' + helpers.escape(operand1) + ' = __forloopIter[__forloopIndex];'
    ,               parser.compile.call(this, indent + '     ')
    , '         }'
    , '     }'
    , ' }'
    , '})();'].join('\n' + indent);
};
exports['for'].ends = true;


/**
 * autoescape
 * Special handling hardcoded into the parser to determine whether variable output should be escaped or not
 */
exports.autoescape = function (indent) {
    return parser.compile.call(this, indent);
};
exports.autoescape.ends = true;
