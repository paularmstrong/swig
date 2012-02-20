var swig = require('../index'),
    DateZ = require('./dateformat').DateZ;

swig.init({ 
    allowErrors: true,
    dateStrings:{
        days:{
            full: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
            abbr: ['lun', 'mar', 'mié', 'jue', 'vie', 'sab', 'dom'],
            alt: {'-1': 'de ayer', 0: 'de hoy', 1: 'de mañana'}
        },
        months:{
            full: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
            abbr: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
        },
        ordinals: [
            { comparator : function(number){ return number % 10 === 1 || number % 10 === 3; }, result:"er" },
            { comparator : function(number){ return true; }, result:".o" }
        ]
        // AM and PM are the same in spanish so use defaults
    }
 });

function testFilter(test, filter, input, output, message) {
    var tpl = swig.compile('{{ v|' + filter + ' }}');
    test.strictEqual(tpl(input), output, message);
}

// Create dates for a particular timezone offset.
// For example, specifying 480 (offset in minutes) for tzOffset creates a date
// in your local timezone that is the same date as the specified y,m,d,h,i,s in PST.
function makeDate(tzOffset, y, m, d, h, i, s) {
    var date = new Date(y, m || 0, d || 0, h || 0, i || 0, s || 0),
        offset = date.getTimezoneOffset();

    if (offset !== tzOffset) { // timezone offset in PST for september
        date = new Date(date.getTime() - ((offset * 60000) - (tzOffset * 60000)));
    }

    return date;
}

exports.date = function (test) {
    var date = makeDate(420, 2011, 8, 6, 9, 5, 2),
        tpl = swig.compile('{{ d|date("d", 420) }}');

    function testFormat(format, expected) {
        testFilter(test, 'date("' + format + '", 420)', { v: date }, expected, format);
    }
    // Day
    testFormat('D', 'mié');
    testFormat('l', 'miércoles');
    testFormat('S', '.o');

    // Month
    testFormat('F', 'septiembre');
    testFormat('M', 'sep');

    // Time
    testFormat('a', 'am');
    testFormat('A', 'AM');

    // Test teen ordinals
    date = makeDate(420, 2011, 8, 11, 9, 5, 2),

    testFormat('D', 'lun');
    testFormat('l', 'lunes');
    testFormat('S', 'er');

    test.done();
};
