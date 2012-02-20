var _ = require('underscore');

/*
DateZ is licensed under the MIT License:
Copyright (c) 2011 Tomo Universalis (http://tomouniversalis.com)
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: 
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
exports.defaultTZOffset = 0;
exports._months = {
        full: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        abbr: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };
exports._days = {
        full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        abbr: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        alt: {'-1': 'Yesterday', 0: 'Today', 1: 'Tomorrow'}
    };
exports._ampm = [
        { comparator:function(hour){ return hour < 12; }, result: "am"},
        { comparator:function(hour){ return hour >= 12; }, result: "pm"},
    ];
exports._AMPM = [
        { comparator:function(hour){ return hour < 12; }, result: "AM"},
        { comparator:function(hour){ return hour >= 12; }, result: "PM"},
    ];
exports._ordinals = [
        { comparator:function(day){ return day % 10 === 1 && day !== 11; }, result: "st"},
        { comparator:function(day){ return day % 10 === 2 && day !== 12; }, result: "nd"},
        { comparator:function(day){ return day % 10 === 3 && day !== 13; }, result: "rd"},
        { comparator:function(day){ return true; },  result: "th"} // default
    ];
exports.DateZ = function () {
    var members = {
            'default': ['getUTCDate', 'getUTCDay', 'getUTCFullYear', 'getUTCHours', 'getUTCMilliseconds', 'getUTCMinutes', 'getUTCMonth', 'getUTCSeconds', 'toISOString', 'toGMTString', 'toUTCString', 'valueOf', 'getTime'],
            z: ['getDate', 'getDay', 'getFullYear', 'getHours', 'getMilliseconds', 'getMinutes', 'getMonth', 'getSeconds', 'getYear', 'toDateString', 'toLocaleDateString', 'toLocaleTimeString'],
            'string': ['toLocaleString', 'toString', 'toTimeString'],
            zSet: ['setDate', 'setFullYear', 'setHours', 'setMilliseconds', 'setMinutes', 'setMonth', 'setSeconds', 'setTime', 'setYear'],
            set: ['setUTCDate', 'setUTCFullYear', 'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes', 'setUTCMonth', 'setUTCSeconds'],
            'static': ['UTC', 'parse']
        },
        d = this,
        i;

    d.date = d.dateZ = (arguments.length > 1) ? new Date(Date.UTC.apply(Date, arguments) + ((new Date()).getTimezoneOffset() * 60000)) : (arguments.length === 1) ? new Date(new Date(arguments['0'])) : new Date();

    d.timezoneOffset = d.dateZ.getTimezoneOffset();

    function zeroPad(i) {
        return (i < 10) ? '0' + i : i;
    }
    function _toTZString() {
        var hours = zeroPad(Math.floor(Math.abs(d.timezoneOffset) / 60)),
            minutes = zeroPad(Math.abs(d.timezoneOffset) - hours * 60),
            prefix = (d.timezoneOffset < 0) ? '+' : '-',
            abbr = (d.tzAbbreviation === undefined) ? '' : ' (' + d.tzAbbreviation + ')';

        return 'GMT' + prefix + hours + minutes + abbr;
    }

    _.each(members.z, function (name) {
        d[name] = function () {
            return d.dateZ[name]();
        };
    });
    _.each(members.string, function (name) {
        d[name] = function () {
            return d.dateZ[name].apply(d.dateZ, []).replace(/GMT[+\-]\\d{4} \\(([a-zA-Z]{3,4})\\)/, _toTZString());
        };
    });
    _.each(members['default'], function (name) {
        d[name] = function () {
            return d.date[name]();
        };
    });
    _.each(members['static'], function (name) {
        d[name] = function () {
            return Date[name].apply(Date, arguments);
        };
    });
    _.each(members.zSet, function (name) {
        d[name] = function () {
            d.dateZ[name].apply(d.dateZ, arguments);
            d.date = new Date(d.dateZ.getTime() - d.dateZ.getTimezoneOffset() * 60000 + d.timezoneOffset * 60000);
            return d;
        };
    });
    _.each(members.set, function (name) {
        d[name] = function () {
            d.date[name].apply(d.date, arguments);
            d.dateZ = new Date(d.date.getTime() + d.date.getTimezoneOffset() * 60000 - d.timezoneOffset * 60000);
            return d;
        };
    });

    if (exports.defaultTZOffset) {
        this.setTimezoneOffset(exports.defaultTZOffset);
    }
};
exports.DateZ.prototype = {
    getTimezoneOffset: function () {
        return this.timezoneOffset;
    },
    setTimezoneOffset: function (offset, abbr) {
        this.timezoneOffset = offset;
        if (abbr) {
            this.tzAbbreviation = abbr;
        }
        this.dateZ = new Date(this.date.getTime() + this.date.getTimezoneOffset() * 60000 - this.timezoneOffset * 60000);
        return this;
    }
};

// Day
exports.d = function (input) {
    return (input.getDate() < 10 ? '0' : '') + input.getDate();
};
exports.D = function (input) {
    return exports._days.abbr[input.getDay()];
};
exports.j = function (input) {
    return input.getDate();
};
exports.l = function (input) {
    return exports._days.full[input.getDay()];
};
exports.N = function (input) {
    return input.getDay() + 1;
};
exports.S = function (input) {
    var d = input.getDate();
    var s;
    _.each(exports._ordinals, function(element, index, list){
        if(typeof s !== "undefined") return;
        var comparator = element.comparator;
        if(comparator(d)) s = element.result;
    });
    return s;
};
exports.w = function (input) {
    return input.getDay();
};
exports.z = function (input, offset, abbr) {
    var year = input.getFullYear(),
        e = new exports.DateZ(year, input.getMonth(), input.getDate(), 12, 0, 0),
        d = new exports.DateZ(year, 0, 1, 12, 0, 0);

    e.setTimezoneOffset(offset, abbr);
    d.setTimezoneOffset(offset, abbr);
    return Math.round((e - d) / 86400000);
};

// Week
exports.W = function (input) {
    var target = new Date(input.valueOf()),
        dayNr = (input.getDay() + 6) % 7,
        fThurs;

    target.setDate(target.getDate() - dayNr + 3);
    fThurs = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }

    return 1 + Math.ceil((fThurs - target) / 604800000);
};

// Month
exports.F = function (input) {
    return exports._months.full[input.getMonth()];
};
exports.m = function (input) {
    return (input.getMonth() < 9 ? '0' : '') + (input.getMonth() + 1);
};
exports.M = function (input) {
    return exports._months.abbr[input.getMonth()];
};
exports.n = function (input) {
    return input.getMonth() + 1;
};
exports.t = function (input) {
    return 32 - (new Date(input.getFullYear(), input.getMonth(), 32).getDate());
};

// Year
exports.L = function (input) {
    return new Date(input.getFullYear(), 1, 29).getDate() === 29;
};
exports.o = function (input) {
    var target = new Date(input.valueOf());
    target.setDate(target.getDate() - ((input.getDay() + 6) % 7) + 3);
    return target.getFullYear();
};
exports.Y = function (input) {
    return input.getFullYear();
};
exports.y = function (input) {
    return (input.getFullYear().toString()).substr(2);
};

// Time
exports.a = function (input) {
    var s;
    var d = input.getHours();
    _.each(exports._ampm, function(element, index, list){
        if(typeof s !== "undefined") return;
        var comparator = element.comparator;
        if(comparator(d)) s = element.result;
    });
    return s;
};
exports.A = function (input) {
    var s;
    var d = input.getHours();
    _.each(exports._AMPM, function(element, index, list){
        if(typeof s !== "undefined") return;
        var comparator = element.comparator;
        if(comparator(d)) s = element.result;
    });
    return s;
};
exports.B = function (input) {
    var hours = input.getUTCHours(), beats;
    hours = (hours === 23) ? 0 : hours + 1;
    beats = Math.abs(((((hours * 60) + input.getUTCMinutes()) * 60) + input.getUTCSeconds()) / 86.4).toFixed(0);
    return ('000'.concat(beats).slice(beats.length));
};
exports.g = function (input) {
    var h = input.getHours();
    return h === 0 ? 12 : (h > 12 ? h - 12 : h);
};
exports.G = function (input) {
    return input.getHours();
};
exports.h = function (input) {
    var h = input.getHours();
    return ((h < 10 || (12 < h && 22 > h)) ? '0' : '') + ((h < 12) ? h : h - 12);
};
exports.H = function (input) {
    var h = input.getHours();
    return (h < 10 ? '0' : '') + h;
};
exports.i = function (input) {
    var m = input.getMinutes();
    return (m < 10 ? '0' : '') + m;
};
exports.s = function (input) {
    var s = input.getSeconds();
    return (s < 10 ? '0' : '') + s;
};
//u = function () { return ''; },

// Timezone
//e = function () { return ''; },
//I = function () { return ''; },
exports.O = function (input) {
    var tz = input.getTimezoneOffset();
    return (tz < 0 ? '-' : '+') + (tz / 60 < 10 ? '0' : '') + (tz / 60) + '00';
};
//T = function () { return ''; },
exports.Z = function (input) {
    return input.getTimezoneOffset() * 60;
};

// Full Date/Time
exports.c = function (input) {
    return input.toISOString();
};
exports.r = function (input) {
    return input.toUTCString();
};
exports.U = function (input) {
    return input.getTime() / 1000;
};
