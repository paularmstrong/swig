exports.compile = function (compiler, setup, args, content, teardown) {
  return compiler(content);
};

exports.parse = function (str) {
  return str;
};

exports.ends = true;
