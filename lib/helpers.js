var parser = require('./parser'),
    _ = require('underscore'),
    filters = require('./filters'),
    // Javascript keywords can't be a name: 'for.is_invalid' as well as 'for' but not 'for_' or '_for'
    KEYWORDS = /^(Array|ArrayBuffer|Boolean|Date|Error|eval|EvalError|Function|Infinity|Iterator|JSON|Math|Namespace|NaN|Number|Object|QName|RangeError|ReferenceError|RegExp|StopIteration|String|SyntaxError|TypeError|undefined|uneval|URIError|XML|XMLList|break|case|catch|continue|debugger|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|this|throw|try|typeof|var|void|while|with)(?=(\.|$))/;

// Returns TRUE if the passed string is a valid javascript string literal
exports.isStringLiteral = function (string) {
    if (typeof string !== 'string') {
        return false;
    }

    var first = string.substring(0, 1),
        last = string.charAt(string.length - 1, 1),
        teststr;

    if ((first === last) && (first === "'" || first === '"')) {
        teststr = string.substr(1, string.length - 2).split('').reverse().join('');

        if ((first === "'" && (/'(?!\\)/).test(teststr)) || (last === '"' && (/"(?!\\)/).test(teststr))) {
            throw new Error('Invalid string literal. Unescaped quote (' + string[0] + ') found.');
        }

        return true;
    }

    return false;
};

// Returns TRUE if the passed string is a valid javascript number or string literal
exports.isLiteral = function (string) {
    var literal = false;

    // Check if it's a number literal
    if ((/^\d+([.]\d+)?$/).test(string)) {
        literal = true;
    } else if (exports.isStringLiteral(string)) {
        literal = true;
    }

    return literal;
};

// Variable names starting with __ are reserved.
exports.isValidName = function (string) {
    return ((typeof string === 'string')
        && string.substr(0, 2) !== '__'
        && (/^([$A-Za-z_]+[$A-Za-z_0-9]*)(\.?([$A-Za-z_]+[$A-Za-z_0-9]*))*$/).test(string)
        && !KEYWORDS.test(string));
};

// Variable names starting with __ are reserved.
exports.isValidShortName = function (string) {
    return string.substr(0, 2) !== '__' && (/^[$A-Za-z_]+[$A-Za-z_0-9]*$/).test(string) && !KEYWORDS.test(string);
};

// Checks if a name is a vlaid block name
exports.isValidBlockName = function (string) {
    return (/^[A-Za-z]+[A-Za-z_0-9]*$/).test(string);
};

/**
* Returns a valid javascript code that will
* check if a variable (or property chain) exists
* in the evaled context. For example:
*    check('foo.bar.baz')
* will return the following string:
*    typeof foo !== 'undefined' && typeof foo.bar !== 'undefined' && typeof foo.bar.baz !== 'undefined'
*/
function check(variable, context) {
    if (_.isArray(variable)) {
        return '(true)';
    }

    variable = variable.replace(/^this/, '__this.__currentContext');

    if (exports.isLiteral(variable)) {
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

    _.each(props, function (prop) {
        chain += chain ? ((isNaN(prop) && !exports.isStringLiteral(prop)) ? '.' + prop : '[' + prop + ']') : prop;
        output.push('typeof ' + chain + ' !== "undefined"');
    });

    return '(' + output.join(' && ') + ')';
}
exports.check = check;

/**
* Returns an escaped string (safe for evaling). If context is passed
* then returns a concatenation of context and the escaped variable name.
*/
exports.escapeVarName = function (variable, context) {
    if (_.isArray(variable)) {
        _.each(variable, function (val, key) {
            variable[key] = exports.escapeVarName(val, context);
        });
        return variable;
    }

    variable = variable.replace(/^this/, '__this.__currentContext');

    if (exports.isLiteral(variable)) {
        return variable;
    } else if (typeof context === 'string' && context.length) {
        variable = context + '.' + variable;
    }

    var chain = '', props = variable.split('.');
    _.each(props, function (prop) {
        chain += (chain ? ((isNaN(prop) && !exports.isStringLiteral(prop)) ? '.' + prop : '[' + prop + ']') : prop);
    });

    return chain.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
};

exports.wrapMethod = function (variable, filter, context) {
    var output = '(function () {\n',
        args;

    variable = variable || '""';

    if (!filter) {
        return variable;
    }

    args = filter.args.split(',');
    args = _.map(args, function (value) {
        var varname,
            stripped = value.replace(/^\s+/, '');

        try {
            varname = '__' + parser.parseVariable(stripped).name.replace(/\W/g, '_');
        } catch (e) {
            return value;
        }

        if (exports.isValidName(stripped)) {
            output += exports.setVar(varname, parser.parseVariable(stripped));
            return varname;
        }

        return value;
    });

    args = (args && args.length) ? args.join(',') : '""';
    if (args.length) {
        output += 'return ' + context + '["' + filter.name + '"].call(this, ' + args + ');\n';
    } else {
        output += 'return ' + context + '["' + filter.name + '"].call(this);\n';
    }

    return output + '})()';
};

exports.wrapFilter = function (variable, filter) {
    var output = '',
        args = '';

    variable = variable || '""';

    if (!filter) {
        return variable;
    }

    if (filters.hasOwnProperty(filter.name)) {
        args = (filter.args) ? variable + ', ' + filter.args : variable;
        output += exports.wrapMethod(variable, { name: filter.name, args: args }, '__filters');
    }

    return output;
};

exports.wrapFilters = function (variable, filters, context, escape) {
    var output = exports.escapeVarName(variable, context);

    if (filters && filters.length > 0) {
        _.each(filters, function (filter) {
            switch (filter.name) {
            case 'raw':
                escape = false;
                return;
            case 'e':
            case 'escape':
                escape = filter.args || escape;
                return;
            default:
                output = exports.wrapFilter(output, filter, '__filters');
                break;
            }
        });
    }

    output = output || '""';
    if (escape) {
        output = '__filters.escape.call(this, ' + output + ', ' + escape + ')';
    }

    return output;
};

exports.setVar = function (varName, argument) {
    var out = 'var ' + varName + ' = "";\n' +
        'if (' + check(argument.name) + ') {\n' +
        '    ' + varName + ' = ' + exports.wrapFilters(exports.escapeVarName(argument.name), argument.filters, null, argument.escape)  + ';\n' +
        '} else if (' + check(argument.name, '__context') + ') {\n' +
        '    ' + varName + ' = ' + exports.wrapFilters(exports.escapeVarName(argument.name), argument.filters, '__context', argument.escape) + ';\n' +
        '}\n';

    if (argument.filters.length) {
        out += ' else if (true) {\n';
        out += '    ' + varName + ' = ' + exports.wrapFilters('', argument.filters, null, argument.escape) + ';\n';
        out += '}\n';
    }

    return out;
};
