var fs = require('fs'),
  path = require('path');

/**
 * Loads templates from the file system.
 * @param {string}   [basepath='']     Path to the templates as string.
 * @param {string}   [encoding=utf8]   Template encoding
 */
module.exports = function (basepath, encoding) {
  var ret = {};

  encoding = encoding || 'utf8';
  basepath = path.normalize(basepath || '/');

  /**
   * Resolves <var>to</var> to an absolute path.
   * @param  {string} to        File path to be resolved.
   * @param  {string} [from]    Base directory path.
   * @return {string}
   */
  ret.resolve = function (to, from) {
    from = (from) ? path.dirname(from) : basepath;
    return path.resolve(from, to);
  };

  /**
   * Loads a single template.
   * @param  {string}   pathname  Path to template file.
   * @param  {function} [cb]      Asynchronous callback function. If not provided, will run synchronously.
   * @return {string}             Template source string.
   */
  ret.load = function (pathname, cb) {
    if (!fs || (cb && !fs.readFile) || !fs.readFileSync) {
      throw new Error('Unable to find file ' + pathname + ' because there is no filesystem to read from.');
    }

    pathname = ret.resolve(pathname);

    if (cb) {
      fs.readFile(pathname, encoding, cb);
      return;
    }
    return fs.readFileSync(pathname, encoding);
  };

  return ret;
};
