exports.compile = function (compiler, setup, args, content, parent, teardown) {
  return compiler(content, parent);
};

exports.parse = function (str) {
  return str;
};

exports.ends = true;
