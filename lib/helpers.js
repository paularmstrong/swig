var parser = require('./parser'),
    _ = require('underscore'),
    filters = require('./filters'),
    // Checks if there are unescaped single quotes (the string needs to be reversed first)
    UNESCAPED_QUOTE  = /'(?!\\)/,
    // Checks if there are unescaped double quotes (the string needs to be reversed first)
    UNESCAPED_DQUOTE = /"(?!\\)/,
    // Javascript keywords can't be a name: 'for.is_invalid' as well as 'for' but not 'for_' or '_for'
    KEYWORDS = /^(Array|ArrayBuffer|Boolean|Date|Error|eval|EvalError|Function|Infinity|Iterator|JSON|Math|Namespace|NaN|Number|Object|QName|RangeError|ReferenceError|RegExp|StopIteration|String|SyntaxError|TypeError|undefined|uneval|URIError|XML|XMLList|break|case|catch|continue|debugger|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|this|throw|try|typeof|var|void|while|with)(?=(\.|$))/;

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

        if ((string[0] === "'" && UNESCAPED_QUOTE.test(teststr)) || (string[1] === '"' && UNESCAPED_DQUOTE.test(teststr))) {
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

        if ((string[0] === "'" && UNESCAPED_QUOTE.test(teststr)) || (string[1] === '"' && UNESCAPED_DQUOTE.test(teststr))) {
            throw new Error('Invalid string literal. Unescaped quote (' + string[0] + ') found.');
        }

        return true;
    }

    return false;
}
exports.isStringLiteral = isStringLiteral;

// Variable names starting with __ are reserved.
function isValidName(string) {
    return ((typeof string === 'string')
        && string.substr(0, 2) !== '__'
        && (/^([$A-Za-z_]+[$A-Za-z_0-9]*)(\.?([$A-Za-z_]+[$A-Za-z_0-9]*))*$/).test(string)
        && !KEYWORDS.test(string));
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
    if (Array.isArray(variable)) {
        return '(true)';
    }

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
    if (Array.isArray(variable)) {
        _.each(variable, function (val, key) {
            variable[key] = exports.escape(val, context);
        });
        return variable;
    }

    variable = variable.replace(/^this/, '__this.__currentContext');

    if (isLiteral(variable)) {
        return variable;
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
        return input.replace(/&(?!amp;|lt;|gt;|quot;|#39;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    } else {
        return input;
    }
};

exports.wrapFilter = function (variable, filter) {
    var output = '(function () {',
        args;

    if (!filter) {
        return variable;
    }

    if (filters.hasOwnProperty(filter.name)) {
        args = [variable];
        _.each(filter.args, function (value, key) {
            if (exports.isValidName(value)) {
                output += exports.setVar('__' + parser.parseVariable(value).name.replace(/\W/g, '_'), parser.parseVariable(value));
                args.push('__' + parser.parseVariable(value).name.replace(/\W/g, '_'));
            } else if (_.isArray(value) || typeof value === 'object') {
                args.push(value);
            } else {
                value += '';
                args.push(('\'' + value.replace(/(^\"|\"$)/g, '') + '\''));
            }
        });
        output += 'return __filters.' + filter.name + '.apply(this, ' + JSON.stringify(args).replace(/\"/g, '').replace(/\\'/g, '') + ')';
    }

    return output + '})()';
};

exports.wrapFilters = function (variable, filters, context, escape) {
    var output = exports.escape(variable, context);

    if (filters && filters.length > 0) {
        filters.forEach(function (filter) {
            switch (filter.name) {
            case 'raw':
                escape = false;
                return;
            case 'e':
            case 'escape':
                escape = true;
                return;
            default:
                output = exports.wrapFilter(output, filter);
                break;
            }
        });
    }

    if (escape) {
        output = '__escape.apply(this, [' + output + '])';
    } else {
        output = output || '""';
    }

    return output;
};

exports.setVar = function (varName, argument) {
    var out = 'var ' + varName + ' = "";' +
        'if (' + check(argument.name) + ') {' +
        '    ' + varName + ' = ' + exports.wrapFilters(exports.escape(argument.name), argument.filters, null, argument.escape)  + ';' +
        '} else if (' + check(argument.name, '__context') + ') {' +
        '    ' + varName + ' = ' + exports.wrapFilters(exports.escape(argument.name), argument.filters, '__context', argument.escape) + ';' +
        '}';

    if (argument.filters.length) {
        out += ' else if (true) {';
        out += '    ' + varName + ' = ' + exports.wrapFilters('', argument.filters, null, argument.escape) + ';';
        out += '}';
    }

    return out;
};
