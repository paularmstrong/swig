var path = require('path'),
  utils = require('../utils');

/**
 * Loads templates from a provided object mapping.
 * @param {object} mapping Hash object with template paths as keys and template sources as values.
 */
module.exports = function (mapping) {
  var ret = {};

  /**
   * Resolves <var>to</var> to an absolute path.
   * @param  {string} to        File path to be resolved.
   * @param  {string} [from]    Base directory path.
   * @return {string}
   */
  ret.resolve = function (to, from) {
    return path.resolve(path.dirname(path.normalize('/')), to);
  };

  /**
   * Loads a single template.
   * @param  {string} pathname  Path to template file.
   * @param  {function} [cb]    Asynchronous callback function. If not provided, will run synchronously.
   * @return {string}           Template source string.
   */
  ret.load = function (pathname, cb) {
    var src, paths;

    pathname = ret.resolve(pathname);
    paths = [pathname, pathname.replace(/^(\/|\\)/, '')];

    src = mapping[paths[0]] || mapping[paths[1]];
    if (!src) {
      utils.throwError('Unable to find template ' + pathname + '.');
    }

    if (cb) {
      cb(null, src);
      return;
    }
    return src;
  };

  return ret;
};
