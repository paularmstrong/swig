exports.require = function (file) {
  if (process.env.SWIG_COVERAGE) {
    file = file.replace('/lib/', '/lib-cov/');
  }
  return require(file);
};
