exports.compile = function (compiler, setup, args, content, teardown) {
  return '';
};

exports.parse = function (str) {
  return str.replace(/^\'|\'$/g, '').replace(/^\"|\"$/g, '');
};

exports.ends = false;
