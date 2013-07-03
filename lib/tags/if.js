exports.compile = function (parser, setup, args, content, teardown) {
  return [
    setup,
    'if (' + args + ') {',
    parser.compile(content),
    '}',
    teardown
  ].join('\n');
};

exports.parse = function (str) {
  return str;
};

exports.ends = true;
