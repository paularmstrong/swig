exports.strip = function (input) {
  return input.replace(/^\s+|\s+$/g, '');
};

exports.startsWith = function (str, prefix) {
  return str.indexOf(prefix) === 0;
};

exports.endsWith = function (str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
};
