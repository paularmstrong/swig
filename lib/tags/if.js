exports.compile = function (compiler, setup, args, content, teardown) {
  return [
    setup,
    'if (' + args + ') {',
    compiler(content),
    '}',
    teardown
  ].join('\n');
};

exports.parse = function (str) {
  return str;
};

exports.ends = true;
