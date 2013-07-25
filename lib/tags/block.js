exports.compile = function (compiler, setup, args, content, parent, teardown) {
  return compiler(content, parent);
};

exports.parse = function (str, line, parser, types) {};
exports.ends = true;
