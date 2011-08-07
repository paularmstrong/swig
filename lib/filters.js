var helpers = require('./helpers'),
    escape = helpers.escape,
    _filters, _dateFormats;

_dateFormats = {
	_months: {
	    full: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	    abbr: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
	},
	_days: {
        full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        abbr: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        alt: {'-1': 'Yesterday', 0: 'Today', 1: 'Tomorrow'}
	},
    // Day
    d: "function () { return (this.getDate() < 10 ? '0' : '') + this.getDate(); }",
    D: "function () { return _dateFormats._days.abbr[this.getDay()]; }",
    j: "function () { return this.getDate(); }",
    l: "function () { return _dateFormats._days.full[this.getDay()]; }",
    N: "function () { return this.getDay(); }",
    S: "function () { return (this.getDate() % 10 === 1 && this.getDate() !== 11 ? 'st' : (this.getDate() % 10 === 2 && this.getDate() !== 12 ? 'nd' : (this.getDate() % 10 === 3 && this.getDate() !== 13 ? 'rd' : 'th'))); }",
    w: "function () { return this.getDay() - 1; }",
    //z: function () { return ''; },

    // Week
    //W: function () { return ''; },

    // Month
    F: "function () { return _dateFormats._months.full[this.getMonth()]; }",
    m: "function () { return (this.getMonth() < 8 ? '0' : '') + (this.getMonth() + 1); }",
    M: "function () { return _dateFormats._months.abbr[this.getMonth()]; }",
    n: "function () { return this.getMonth() + 1; }",
    //t: function () {  return ''; },

    // Year
    //L: function () { return ''; },
    //o: function () { return ''; },
    Y: "function () { return this.getFullYear(); }",
    y: "function () { return ('' + this.getFullYear()).substr(2); }",

    // Time
    a: "function () { return this.getHours() < 12 ? 'am' : 'pm'; }",
    A: "function () { return this.getHours() < 12 ? 'AM' : 'PM'; }",
    //B: function () { return ''; },
    g: "function () { return this.getHours() === 0 ? 12 : (this.getHours() > 12 ? this.getHours() - 12 : this.getHours()); }",
    G: "function () { return this.getHours(); }",
    h: "function () { return (this.getHours() < 10 || (12 < this.getHours() < 22) ? '0' : '') + (this.getHours() < 10 ? this.getHours() : this.getHours() - 12); }",
    H: "function () { return (this.getHours() < 10 ? '0' : '') + this.getHours(); }",
    i: "function () { return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes(); }",
    s: "function () { return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds(); }",
    //u: function () { return ''; },

    // Timezone
    //e: function () { return ''; },
    //I: function () { return ''; },
    O: "function () { return (this.getTimezoneOffset() < 0 ? '-' : '+') + (this.getTimezoneOffset() / 60 < 10 ? '0' : '') + (this.getTimezoneOffset() / 60) + '00'; }",
    //T: function () { return ''; },
    Z: "function () { return this.getTimezoneOffset() * 60; }",

    // Full Date/Time
    //c: function () { return ''; },
    r: "function () { return this.toString(); }",
    U: "function () { return this.getTime() / 1000; }"
};

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
    },

    url_encode: function () {
        return '(function () { return encodeURIComponent(' + this + '); })()';
    },

    url_decode: function () {
        return '(function () { return decodeURIComponent(' + this + '); })()';
    },

    json_encode: function () {
        return '(function () { return JSON.stringify(' + this + '); })()';
    },

    striptags: function () {
        return '(function () { return ' + this + '.toString().replace(/(<([^>]+)>)/ig, ""); })()';
    },

    date: function (format) {
        var formatters = [], l = format.length, cur, t;
        while (l--) {
            cur = format.charAt(l);
            formatters.push((_dateFormats.hasOwnProperty(cur)) ? 'b = ' + _dateFormats[cur] : cur);
        }
        formatters.shift();
        formatters.pop();
        return [
            '(function () {'
                , 'var out = "", i = 0, cur,'
                , 'formatters = ' + JSON.stringify(formatters) + ','
                , 'date = new Date(' + this + ');'
                , 'for (i; i < ' + formatters.length + '; i += 1) {'
                    , 'if (typeof eval(formatters[i]) === "function") {'
                        , 'out += eval(formatters[i]).call(date);'
                    , '} else {'
                        , 'out += formatters[i];'
                    , '}'
                , '}'
                , 'return out;'
            , '})()'
        ].join('');
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
