var _dateFormats = module.exports = {
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
    d: function (input) {
        return (input.getDate() < 10 ? '0' : '') + input.getDate();
    },
    D: function (input) {
        return _dateFormats._days.abbr[input.getDay()];
    },
    j: function (input) {
        return input.getDate();
    },
    l: function (input) {
        return _dateFormats._days.full[input.getDay()];
    },
    N: function (input) {
        return input.getDay();
    },
    S: function (input) {
        return (input.getDate() % 10 === 1 && input.getDate() !== 11 ? 'st' : (input.getDate() % 10 === 2 && input.getDate() !== 12 ? 'nd' : (input.getDate() % 10 === 3 && input.getDate() !== 13 ? 'rd' : 'th')));
    },
    w: function (input) {
        return input.getDay() - 1;
    },
    //z = function (input) { return ''; },

    // Week
    //W = function (input) { return ''; },

    // Month
    F: function (input) {
        return _dateFormats._months.full[input.getMonth()];
    },
    m: function (input) {
        return (input.getMonth() < 9 ? '0' : '') + (input.getMonth() + 1);
    },
    M: function (input) {
        return _dateFormats._months.abbr[input.getMonth()];
    },
    n: function (input) {
        return input.getMonth() + 1;
    },
    //t = function (input) { return ''; },

    // Year
    //L = function (input) { return ''; },
    //o = function (input) { return '';  },
    Y: function (input) {
        return input.getFullYear();
    },
    y: function (input) {
        return (input.getFullYear().toString()).substr(2);
    },

    // Time
    a: function (input) {
        return input.getHours() < 12 ? 'am' : 'pm';
    },
    A: function (input) {
        return input.getHours() < 12 ? 'AM' : 'PM';
    },
    //B = function () { return ''; },
    g: function (input) {
        return input.getHours() === 0 ? 12 : (input.getHours() > 12 ? input.getHours() - 12 : input.getHours());
    },
    G: function (input) {
        return input.getHours();
    },
    h: function (input) {
        return (input.getHours() < 10 || (12 < input.getHours() < 22) ? '0' : '') + (input.getHours() < 10 ? input.getHours() : input.getHours() - 12);
    },
    H: function (input) {
        return (input.getHours() < 10 ? '0' : '') + input.getHours();
    },
    i: function (input) {
        return (input.getMinutes() < 10 ? '0' : '') + input.getMinutes();
    },
    s: function (input) {
        return (input.getSeconds() < 10 ? '0' : '') + input.getSeconds();
    },
    //u = function () { return ''; },

    // Timezone
    //e = function () { return ''; },
    //I = function () { return ''; },
    O: function (input) {
        return (input.getTimezoneOffset() < 0 ? '-' : '+') + (input.getTimezoneOffset() / 60 < 10 ? '0' : '') + (input.getTimezoneOffset() / 60) + '00';
    },
    //T = function () { return ''; },
    Z: function (input) {
        return input.getTimezoneOffset() * 60;
    },

    // Full Date/Time
    //c = function () { return ''; },
    r: function (input) {
        return input.toString();
    },
    U: function (input) {
        return input.getTime() / 1000;
    }
};