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
    return (input.getDate() % 10 === 1 && input.getDate() !== 11 ? 'st' : (input.getDate() % 10 === 2 && input.getDate() !== 12 ? 'nd' : (input.getDate() % 10 === 3 && input.getDate() !== 13 ? 'rd' : 'th')));
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
    return input.getHours() === 0 ? 12 : (input.getHours() > 12 ? input.getHours() - 12 : input.getHours());
};
exports.G = function (input) {
    return input.getHours();
};
exports.h = function (input) {
    return (input.getHours() < 10 || (12 < input.getHours() < 22) ? '0' : '') + (input.getHours() < 10 ? input.getHours() : input.getHours() - 12);
};
exports.H = function (input) {
    return (input.getHours() < 10 ? '0' : '') + input.getHours();
};
exports.i = function (input) {
    return (input.getMinutes() < 10 ? '0' : '') + input.getMinutes();
};
exports.s = function (input) {
    return (input.getSeconds() < 10 ? '0' : '') + input.getSeconds();
};
//u = function () { return ''; },

// Timezone
//e = function () { return ''; },
//I = function () { return ''; },
exports.O = function (input) {
    return (input.getTimezoneOffset() < 0 ? '-' : '+') + (input.getTimezoneOffset() / 60 < 10 ? '0' : '') + (input.getTimezoneOffset() / 60) + '00';
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
    return input.toString();
};
exports.U = function (input) {
    return input.getTime() / 1000;
};
