exports.compile = function (compiler, args, content, parent) {
  return compiler(content, parent);
};

exports.parse = function (str, line, parser, types) {};
exports.ends = true;
