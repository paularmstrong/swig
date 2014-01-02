var path = require('path'),
  utils = require('../utils');

/**
 * Loads templates from a provided object mapping.
 * @param {object} mapping Hash object with template paths as keys and template sources as values.
 */
module.exports = function (mapping) {
  this.mapping = mapping;
  var self = this;

  /**
   * Resolves <var>to</var> to an absolute path.
   * @param  {string} to        File path to be resolved.
   * @param  {string} [from]      Base directory path.
   * @return {string}
   */
  this.resolve = function (to) {
    return path.resolve(path.dirname(path.normalize('/')), to);
  };

  /**
   * Loads a single template.
   * @param  {string} pathname  Path to template file.
   * @param  {function} [cb]    Asynchronous callback function. If not provided, will run synchronously.
   * @return {string}           Template source string.
   */
  this.load = function (pathname, cb) {
    var src, paths;

    pathname = self.resolve(pathname);
    paths = [pathname, pathname.replace(/^(\/|\\)/, '')];

    src = self.mapping[paths[0]] || self.mapping[paths[1]];
    if (!src) {
      utils.throwError('Unable to find template ' + pathname + '.');
    }

    if (cb) {
      cb(null, src);
      return;
    }
    return src;
  };
};
