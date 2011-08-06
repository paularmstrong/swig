var helpers = require('./helpers'),
    escape = helpers.escape,
    _filters;

_filters = {
    lower: function () {
        return '(function () { return ' + this + '.toString().toLowerCase(); })()';
    },

    upper: function () {
        return '(function () { return ' + this + '.toString().toUpperCase(); })()';
    },

    capitalize: function () {
        return '(function () { return ' + this + '.toString().charAt(0).toUpperCase() + ' + this + '.toString().substr(1).toLowerCase(); })()';
    },

    title: function () {
        return '(function () { return ' + this + '.toString().replace(/\\w\\S*/g, function (str) { return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase(); }); })()';
    },

    join: function (separator) {
        return '(function () { if (Array.isArray(' + this + ')) { return ' + this + '.join(' + separator + '); } else { return ' + this + ' } })()';
    },

    length: function () {
        return '(function () { return ' + this + '.length; })()';
    }
};

function wrapFilter(variable, filter) {
    var matches = filter.match(/(\w*)\((.*)\)/),
        output = variable;

    if (matches && matches.length && _filters.hasOwnProperty(matches[1])) {
        output = _filters[matches[1]].call(variable, matches[2]);
    } else {
        output = _filters[filter].call(variable);
    }

    return output;
}

exports.wrap = function (variable, filters, context) {
    var output = escape(variable, context);

    if (filters && filters.length > 0) {
        filters.forEach(function (filter) {
            output = wrapFilter(output, filter);
        });
    }

    return output;
};
