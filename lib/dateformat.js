var _months = {
        full: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        abbr: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    _days = {
        full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        abbr: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        alt: {'-1': 'Yesterday', 0: 'Today', 1: 'Tomorrow'}
    };

// Day
exports.d = function (input) {
    return (input.getDate() < 10 ? '0' : '') + input.getDate();
};
exports.D = function (input) {
    return _days.abbr[input.getDay()];
};
exports.j = function (input) {
    return input.getDate();
};
exports.l = function (input) {
    return _days.full[input.getDay()];
};
exports.N = function (input) {
    return input.getDay();
};
exports.S = function (input) {
    var d = input.getDate();
    return (d % 10 === 1 && d !== 11 ? 'st' : (d % 10 === 2 && d !== 12 ? 'nd' : (d % 10 === 3 && d !== 13 ? 'rd' : 'th')));
};
exports.w = function (input) {
    return input.getDay() - 1;
};
exports.z = function (input) {
    var year = input.getFullYear();
    return Math.round(((new Date(year, input.getMonth(), input.getDate(), 12, 0, 0)) - (new Date(year, 0, 1, 12, 0, 0))) / 86400000);
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
    return _months.full[input.getMonth()];
};
exports.m = function (input) {
    return (input.getMonth() < 9 ? '0' : '') + (input.getMonth() + 1);
};
exports.M = function (input) {
    return _months.abbr[input.getMonth()];
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
    return input.getHours() < 12 ? 'am' : 'pm';
};
exports.A = function (input) {
    return input.getHours() < 12 ? 'AM' : 'PM';
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
