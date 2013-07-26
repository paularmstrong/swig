exports.compile = function (compiler, args, content, parent) {
  return compiler(content, parent);
};

exports.parse = function () {
  return true;
};

exports.ends = true;
