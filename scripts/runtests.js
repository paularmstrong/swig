var util = require('util'),
    child_process = require('child_process'),
    nodeunit = require('nodeunit'),
    configFile = __dirname + '/config-test',
    ignore = '',
    path = require('path'),
    fs = require('fs'),
    track = require(__dirname + '/../node_modules/nodeunit/lib/track'),
    utils = require(__dirname + '/../node_modules/nodeunit/lib/utils'),
    AssertionError = require(__dirname + '/../node_modules/nodeunit/lib/assert').AssertionError,
    config, i, l;

process.argv.forEach(function (val, index, array) {
    if (index < 2) {
        return;
    }

    if (val === '-c') {
        configFile = process.argv[~~index + 1];
    }
});

config = require(configFile);

/*!
 * Nodeunit
 * Copyright (c) 2010 Caolan McMahon
 * MIT Licensed
 */
function run(files, options) {

    if (!options) {
        options = JSON.parse(fs.readFileSync(__dirname + '/../node_modules/nodeunit/bin/nodeunit.json', 'utf8'));
    }

    var content,
        names,
        i = 0,
        error = function (str) {
            return options.error_prefix + str + options.error_suffix;
        },
        ok = function (str) {
            return options.ok_prefix + str + options.ok_suffix;
        },
        bold = function (str) {
            return options.bold_prefix + str + options.bold_suffix;
        },
        assertion_message = function (str) {
            return options.assertion_prefix + str + options.assertion_suffix;
        },
        start = new Date().getTime(),
        paths = files.map(function (p) {
            return path.join(process.cwd(), p);
        }),
        tracker = track.createTracker(function (tracker) {
            if (tracker.unfinished()) {
                console.log('');
                console.log(error(bold(
                    'FAILURES: Undone tests (or their setups/teardowns): '
                )));
                names = tracker.names();
                for (i; i < names.length; i += 1) {
                    console.log('- ' + names[i]);
                }
                console.log('');
                console.log('To fix this, make sure all tests call test.done()');
                process.reallyExit(tracker.unfinished());
            }
        });

    nodeunit.runFiles(paths, {
        testspec: options.testspec,
        moduleStart: function (name) {
            console.log('\n' + bold(name));
        },
        testDone: function (name, assertions) {
            tracker.remove(name);

            if (!assertions.failures()) {
                console.log('✔ ' + name);
            }
            else {
                console.log(error('✖ ' + name) + '\n');
                assertions.forEach(function (a) {
                    if (a.failed()) {
                        a = utils.betterErrors(a);
                        if (a.error instanceof AssertionError && a.message) {
                            console.log(
                                'Assertion Message: ' +
                                assertion_message(a.message)
                            );
                        }
                        console.log(a.error.stack + '\n');
                    }
                });
            }
        },
        done: function (assertions, end) {
            end = end || new Date().getTime();
            var duration = end - start;
            if (assertions.failures()) {
                console.log(
                    '\n' + bold(error('FAILURES: ')) + assertions.failures() +
                    '/' + assertions.length + ' assertions failed (' +
                    assertions.duration + 'ms)'
                );
                process.exit(1);
            }
            else {
                console.log(
                   '\n' + bold(ok('OK: ')) + assertions.length +
                   ' assertions (' + assertions.duration + 'ms)'
                );
            }
        },
        testStart: function (name) {
            tracker.put(name);
        }
    });
}

function runTests(error, stdout, stderr) {
    var tests = stdout.trim().split("\n");
    if (tests.length && tests[0] !== '') {
        run(tests);
    }
}

l = config.pathIgnore.length;
for (i = 0; i < l; i += 1) {
    ignore += ' ! -path "' + config.pathIgnore[i] + '"';
}

child_process.exec('find . -name "*.test.js" ' + ignore, { cwd: config.root }, runTests);
