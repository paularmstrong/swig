#!/usr/bin/env node

var swig = require('../index'),
  optimist = require('optimist'),
  fs = require('fs'),
  path = require('path'),
  filters = require('../lib/filters'),
  utils = require('../lib/utils'),
  uglify = require('uglify-js');

var command,
  argv = optimist
    .usage('\n Usage:\n' +
      '    $0 compile [files] [options]\n' +
      '    $0 render [files] [options]\n' +
      '    $0 build [files] [options]\n'
      )
    .describe({
      o: 'Output locaion, defaults to stdout.',
      h: 'Show this help screen.',
      j: 'Variable context as a JSON file.',
      c: 'Variable context as a CommonJS-style file. Used only if option `j` is not provided.',
      m: 'Minify compiled functions with uglify-js'
    })
    .alias('o', 'output')
    .default('o', 'stdout')
    .alias('h', 'help')
    .alias('j', 'json')
    .alias('c', 'context')
    .alias('m', 'minify')
    .check(function (argv) {
      if (!argv._.length) {
        throw new Error('');
      }

      command = argv._.shift();
      if (command !== 'compile' && command !== 'render' && command !== 'build') {
        throw new Error('Unrecognized command "' + command + '". Use -h for help.');
      }
    })
    .argv,
  ctx = {},
  out = function (file, str) {
    console.log(str);
  },
  efn = function () {},
  anonymous,
  files,
  fn;

if (argv.j) {
  ctx = JSON.parse(fs.readFileSync(argv.j, 'utf8'));
} else if (argv.c) {
  ctx = require(argv.c);
}

if (argv.o !== 'stdout') {
  argv.o += '/';
  argv.o = path.normalize(argv.o);

  try {
    fs.mkdirSync(argv.o);
  } catch (e) {
    if (e.errno !== 47) {
      throw e;
    }
  }

  out = function (file, str) {
    file = path.basename(file);
    fs.writeFileSync(argv.o + file, str);
    console.log('Wrote', argv.o + file);
  };
}

switch (command) {
case 'compile':
  fn = function (file, str) {
    var r = swig.precompile(str, { filename: file, locals: ctx }).tpl.toString();
    if (argv.m) {
      r = uglify.minify(r, { fromString: true }).code;
    }
    out(file, r);
  };
  break;

case 'render':
  fn = function (file, str) {
    (function () {
      eval(str);
      out(file, anonymous(swig, ctx, filters, utils, efn));
    }());
  };
  break;

case 'build':
  fn = function (file, str) {
    out(file, swig.render(str, { filename: file, locals: ctx }));
  };
  break;
}

argv._.forEach(function (file) {
  var str = fs.readFileSync(file, 'utf8');
  fn(file, str);
});
