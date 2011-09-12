var parser  = require('./parser'),
    helpers = require('./helpers'),
    check   = helpers.check,
    escape  = helpers.escape,
    compile = parser.compile;

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
    , ' if (' + check(template) + ') {'
    , '   var __template = ' + escape(template) + ';'
    , ' }'
    , ' else if (' + check(template, '__context') + ') {'
    , '   var __template = ' + escape(template, '__context') + ';'
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
    out.push(' var __op1;');
    out.push(' if (' + check(operand1.name) + ') {');
    out.push('   __op1 = ' + helpers.wrapFilters(escape(operand1.name), operand1.filters, null, false)  + ';');
    out.push(' }');
    out.push(' else if (' + check(operand1.name, '__context') + ') {');
    out.push('   __op1 = ' + helpers.wrapFilters(escape(operand1.name), operand1.filters, '__context', false) + ';');
    out.push(' }');
    if (operand2.name === '') {
        out.push(' if (' + (negation ? '!' : '!!') + '__op1) {');
        out.push(compile.call(this, indent + '   '));
        out.push(' }');
    } else {
        out.push(' var __op2;');
        out.push(' if (' + check(operand2.name) + ') {');
        out.push('   __op2 = ' + helpers.wrapFilters(escape(operand2.name), operand2.filters, null, false) + ';');
        out.push(' }');
        out.push(' else if (' + check(operand2.name, '__context') + ') {');
        out.push('   __op2 = ' + helpers.wrapFilters(escape(operand2.name), operand2.filters, '__context', false) + ';');
        out.push(' }');

        if (typeof operator !== 'undefined') {
            if (operator === 'in') {
                out.push(' if (');
                out.push('    (Array.isArray(__op2) && __op2.indexOf(__op1) > -1) ||');
                out.push('    (typeof __op2 === "string" && __op2.indexOf(__op1) > -1) ||');
                out.push('    (!Array.isArray(__op2) && typeof __op2 === "object" && __op1 in __op2)');
                out.push(' ) {');
                out.push(compile.call(this, indent + '    '));
                out.push(' }');
            } else {
                out.push(' if (__op1 ' + escape(operator) + ' __op2) {');
                out.push(compile.call(this, indent + '    '));
                out.push(' }');
            }
        }
    }
    out.push('})();');
    return out.join('\n' + indent);
};
exports['if'].ends = true;

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
    , ' var ' + escape(operand1) + ','
    , '     forloop = {},'
    , '     __forloopIter;'
    , ' if (' + check(operand2.name) + ') {'
    , '     __forloopIter = ' + helpers.wrapFilters(escape(operand2.name), operand2.filters, null, false) + ';'
    , ' } else if (' + check(operand2.name, '__context') + ') {'
    , '     __forloopIter = ' + helpers.wrapFilters(escape(operand2.name), operand2.filters, '__context', false) + ';'
    , ' } else {'
    , '     return;'
    , ' }'
    , ' if (Array.isArray(__forloopIter)) {'
    , '     var __forloopIndex = 0, __forloopLength = __forloopIter.length;'
    , '     for (; __forloopIndex < __forloopLength; ++__forloopIndex) {'
    , '         forloop.index = __forloopIndex;'
    , '         ' + escape(operand1) + ' = __forloopIter[__forloopIndex];'
    ,           compile.call(this, indent + '     ')
    , '     }'
    , ' } else if (typeof __forloopIter === "object") {'
    , '     var __forloopIndex;'
    , '     for (__forloopIndex in __forloopIter) {'
    , '         if (__forloopIter.hasOwnProperty(__forloopIndex)) {'
    , '             forloop.index = __forloopIndex;'
    , '             ' + escape(operand1) + ' = __forloopIter[__forloopIndex];'
    ,               compile.call(this, indent + '     ')
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
    return compile.call(this, indent);
};
exports.autoescape.ends = true;
