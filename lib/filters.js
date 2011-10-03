var helpers = require('./helpers'),
    _ = require('underscore'),
    _dateFormats = require('./dateformat');

exports.add = function (input, addend) {
    if (Array.isArray(input) && Array.isArray(addend)) {
        return input.concat(addend);
    }

    if (typeof input === 'object' && typeof addend === 'object') {
        return _.extend(input, addend);
    }

    var inputNum = parseInt(input, 10),
        addendNum = parseInt(addend, 10);

    if (_.isNumber(inputNum) && _.isNumber(addendNum)) {
        return inputNum + addendNum;
    }

    return input + addend;
};

exports.addslashes = function (input) {
    if (typeof input === 'object') {
        _.each(input, function (value, key) {
            input[key] = exports.addslashes(value);
        });
        return input;
    }
    return input.replace(/\\/g, '\\\\').replace(/\'/g, "\\'").replace(/\"/g, '\\"');
};

exports.capitalize = function (input) {
    if (typeof input === 'object') {
        _.each(input, function (value, key) {
            input[key] = exports.capitalize(value);
        });
        return input;
    }
    return input.toString().charAt(0).toUpperCase() + input.toString().substr(1).toLowerCase();
};

exports.date = function (input, format) {
    var l = format.length,
        date = new Date(input),
        cur,
        i = 0,
        out = '';

    for (; i < l; i += 1) {
        cur = format.charAt(i);
        if (_dateFormats.hasOwnProperty(cur)) {
            out += _dateFormats[cur](date);
        } else {
            out += cur;
        }
    }
    return out;
};

exports.default = function (input, def) {
    return (typeof input !== 'undefined' && (input || typeof input === 'number')) ? input : def;
};

exports.first = function (input) {
    if (typeof input === 'object' && !Array.isArray(input)) {
        return '';
    }
    return _.first(input);
};

exports.join = function (input, separator) {
    if (Array.isArray(input)) {
        return input.join(separator);
    } else if (typeof input === 'object') {
        var out = [];
        _.each(input, function (value, key) {
            out.push(value);
        });
        return out.join(separator);
    } else {
        return input;
    }
};

exports.json_encode = function (input) {
    return JSON.stringify(input);
};

exports.last = function (input) {
    if (typeof input === 'object' && !Array.isArray(input)) {
        return '';
    }
    return _.last(input);
};

exports.length = function (input) {
    if (typeof input === 'object') {
        return _.keys(input).length;
    }
    return input.length;
};

exports.lower = function (input) {
    if (typeof input === 'object') {
        _.each(input, function (value, key) {
            input[key] = exports.lower(value);
        });
        return input;
    }
    return input.toString().toLowerCase();
};

exports.replace = function (input, search, replacement, flags) {
    var r = new RegExp(search, flags);
    return input.replace(r, replacement);
};

exports.reverse = function (input) {
    if (Array.isArray(input)) {
        return input.reverse();
    } else {
        return input;
    }
};

exports.striptags = function (input) {
    if (typeof input === 'object') {
        _.each(input, function (value, key) {
            input[key] = exports.striptags(value);
        });
        return input;
    }
    return input.toString().replace(/(<([^>]+)>)/ig, '');
};

exports.title = function (input) {
    if (typeof input === 'object') {
        _.each(input, function (value, key) {
            input[key] = exports.title(value);
        });
        return input;
    }
    return input.toString().replace(/\w\S*/g, function (str) {
        return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
    });
};

exports.uniq = function (input) {
    return _.uniq(input);
};

exports.upper = function (input) {
    if (typeof input === 'object') {
        _.each(input, function (value, key) {
            input[key] = exports.upper(value);
        });
        return input;
    }
    return input.toString().toUpperCase();
};

exports.url_encode = function (input) {
    return encodeURIComponent(input);
};

exports.url_decode = function (input) {
    return decodeURIComponent(input);
};
