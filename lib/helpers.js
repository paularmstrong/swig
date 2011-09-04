var _ = require('underscore'),


    // Checks if there are unescaped single quotes (the string needs to be reversed first)
    UNESCAPED_QUOTE  = /'(?!\\)/,
    // Checks if there are unescaped double quotes (the string needs to be reversed first)
    UNESCAPED_DQUOTE = /"(?!\\)/,
    // Javascript keywords can't be a name: 'for.is_invalid' as well as 'for' but not 'for_' or '_for'
    KEYWORDS = /^(Array|RegExpt|Object|String|Number|Math|Error|break|continue|do|for|new|case|default|else|function|in|return|typeof|while|delete|if|switch|var|with)(?=(\.|$))/;

// Returns TRUE if the passed string is a valid javascript number or string literal
function isLiteral(string) {
    var literal = false,
        teststr;

    // Check if it's a number literal
    if ((/^\d+([.]\d+)?$/).test(string)) {
        literal = true;
    } else if ((string[0] === string[string.length - 1]) && (string[0] === "'" || string[0] === '"')) {
         // Check if it's a valid string literal (throw exception otherwise)
        teststr = string.substr(1, string.length - 2).split('').reverse().join('');

        if (string[0] === "'" && UNESCAPED_QUOTE.test(teststr) || string[1] === '"' && UNESCAPED_DQUOTE.test(teststr)) {
            throw new Error('Invalid string literal. Unescaped quote (' + string[0] + ') found.');
        }

        literal = true;
    }

    return literal;
}
exports.isLiteral = isLiteral;

// Returns TRUE if the passed string is a valid javascript string literal
function isStringLiteral(string) {
    // Check if it's a valid string literal (throw exception otherwise)
    if ((string[0] === string[string.length - 1]) && (string[0] === "'" || string[0] === '"')) {
        var teststr = string.substr(1, string.length - 2).split('').reverse().join('');

        if (string[0] === "'" && UNESCAPED_QUOTE.test(teststr) || string[1] === '"' && UNESCAPED_DQUOTE.test(teststr)) {
            throw new Error('Invalid string literal. Unescaped quote (' + string[0] + ') found.');
        }

        return true;
    }

    return false;
}
exports.isStringLiteral = isStringLiteral;

// Variable names starting with __ are reserved.
function isValidName(string) {
    return string.substr(0, 2) !== '__' && (/^([$A-Za-z_]+[$A-Za-z_0-9]*)(\.?([$A-Za-z_]+[$A-Za-z_0-9]*))*$/).test(string) && !KEYWORDS.test(string);
}
exports.isValidName = isValidName;

// Variable names starting with __ are reserved.
function isValidShortName(string) {
    return string.substr(0, 2) !== '__' && (/^[$A-Za-z_]+[$A-Za-z_0-9]*$/).test(string) && !KEYWORDS.test(string);
}
exports.isValidShortName = isValidShortName;

// Checks if a name is a vlaid block name
function isValidBlockName(string) {
    return (/^[A-Za-z]+[A-Za-z_0-9]*$/).test(string);
}
exports.isValidBlockName = isValidBlockName;

/**
* Returns a valid javascript code that will
* check if a variable (or property chain) exists
* in the evaled context. For example:
*    check('foo.bar.baz')
* will return the following string:
*    typeof foo !== 'undefined' && typeof foo.bar !== 'undefined' && typeof foo.bar.baz !== 'undefined'
*/
function check(variable, context) {
    /* 'this' inside of the render function is bound to the tag closure which is meaningless, so we can't use it.
    * '__this' is bound to the original template whose render function we called.
    * Using 'this' in the HTML templates will result in '__this.__currentContext'. This is an additional context
    * for binding data to a specific template - e.g. binding widget data.
    */
    variable = variable.replace(/^this/, '__this.__currentContext');

    if (isLiteral(variable)) {
        return '(true)';
    }

    var props = variable.split(/(\.|\[|\])/),
        chain = '',
        output = [];

    if (typeof context === 'string' && context.length) {
        props.unshift(context);
    }

    props = _.reject(props, function (val) {
        return val === '' || val === '.' || val === '[' || val === ']';
    });

    props.forEach(function (prop) {
        chain += chain ? (isNaN(prop) && prop[0] !== '"' && prop[0] !== "'" ? '.' + prop : '[' + prop + ']') : prop;
        output.push('typeof ' + chain + ' !== "undefined"');
    });

    return '(' + output.join(' && ') + ')';
}
exports.check = check;

/**
* Returns an escaped string (safe for evaling). If context is passed
* then returns a concatenation of context and the escaped variable name.
*/
exports.escape = function (variable, context) {
    /* 'this' inside of the render function is bound to the tag closure which is meaningless, so we can't use it.
    * '__this' is bound to the original template whose render function we called.
    * Using 'this' in the HTML templates will result in '__this.__currentContext'. This is an additional context
    * for binding data to a specific template - e.g. binding widget data.
    */
    variable = variable.replace(/^this/, '__this.__currentContext');

    if (isLiteral(variable)) {
        variable = '(' + variable + ')';
    } else if (typeof context === 'string' && context.length) {
        variable = context + '.' + variable;
    }

    var chain = '', props = variable.split('.');
    props.forEach(function (prop) {
        chain += (chain ? (isNaN(prop) ? '.' + prop : '[' + prop + ']') : prop);
    });

    return chain.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
};

exports.escaper = function (input) {
    if (typeof input === 'string') {
        return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    } else {
        return input;
    }
};
