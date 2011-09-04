var _ = require('underscore');

// Checks if the string is a number literal
var NUMBER_LITERAL   = /^\d+([.]\d+)?$/;
// Checks if there are unescaped single quotes (the string needs to be reversed first)
var UNESCAPED_QUOTE  = /'(?!\\)/;
// Checks if there are unescaped double quotes (the string needs to be reversed first)
var UNESCAPED_DQUOTE = /"(?!\\)/;
// Valid Javascript name: 'name' or 'property.accessor.chain'
var VALID_NAME       = /^([$A-Za-z_]+[$A-Za-z_0-9]*)(\.?([$A-Za-z_]+[$A-Za-z_0-9]*))*$/;
// Valid Javascript name: 'name'
var VALID_SHORT_NAME = /^[$A-Za-z_]+[$A-Za-z_0-9]*$/;
// Javascript keywords can't be a name: 'for.is_invalid' as well as 'for' but not 'for_' or '_for'
var KEYWORDS = /^(Array|RegExpt|Object|String|Number|Math|Error|break|continue|do|for|new|case|default|else|function|in|return|typeof|while|delete|if|switch|var|with)(?=(\.|$))/;
// Valid block name
var VALID_BLOCK_NAME = /^[A-Za-z]+[A-Za-z_0-9]*$/;

// Returns TRUE if the passed string is a valid javascript number or string literal
function isLiteral(string) {
    var literal = false,
        teststr;

    // Check if it's a number literal
    if (NUMBER_LITERAL.test(string)) {
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

// Variable names starting with __ are reserved.
function isValidName(string) {
    return VALID_NAME.test(string) && !KEYWORDS.test(string) && string.substr(0, 2) !== '__';
}

// Variable names starting with __ are reserved.
function isValidShortName(string) {
    return VALID_SHORT_NAME.test(string) && !KEYWORDS.test(string) && string.substr(0, 2) !== '__';
}

// Checks if a name is a vlaid block name
function isValidBlockName(string) {
    return VALID_BLOCK_NAME.test(string);
}

/**
* Returns a valid javascript code that will
* check if a variable (or property chain) exists
* in the evaled context. For example:
*    check('foo.bar.baz')
* will return the following string:
*    typeof foo !== 'undefined' && typeof foo.bar !== 'undefined' && typeof foo.bar.baz !== 'undefined'
*/
exports.check = function (variable, context) {
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
};

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

exports.clone = function (obj) {
    var clone = {},
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof(obj[key]) === 'object') {
                clone[key] = exports.clone(obj[key]);
            } else {
                clone[key] = obj[key];
            }
        }
    }
    return clone;
};

/**
* Merges b into a and returns a
*/
exports.merge = function (a, b) {
    var key, temp = null;

    if (a && b) {
        temp = exports.clone(a);
        for (key in b) {
            if (b.hasOwnProperty(key)) {
                temp[key] = b[key];
            }
        }
    }

    return temp;
};

exports.isLiteral         = isLiteral;
exports.isValidName       = isValidName;
exports.isValidShortName  = isValidShortName;
exports.isValidBlockName  = isValidBlockName;
exports.isStringLiteral   = isStringLiteral;

exports.escaper = function (input) {
    if (typeof input === 'string') {
        return input.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    } else {
        return input;
    }
};
