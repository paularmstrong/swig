var fs = require('fs'),
  path = require('path');

/**
 * Loads templates from the file system.
 * @class
 * @param {string}   [searchpath='']     Path to the templates as string.
 * @param {string}   [encoding=utf8]       Template encoding
 */
module.exports = function (searchpath, encoding) {
  var self = this;

  self.encoding = encoding || 'utf8';
  searchpath = path.normalize(searchpath || '/');

  /**
   * Resolves <var>to</var> to an absolute path.
   * @param  {string} to        File path to be resolved.
   * @param  {string} [from]    Base directory path.
   * @return {string}
   */
  this.resolve = function (to, from) {
    from = from || self.searchpath;
    return path.resolve(path.dirname(from), to);
  };

  /**
   * Loads a single template.
   * @param  {string}   pathname  Path to template file.
   * @param  {function} [cb]      Asynchronous callback function. If not provided, will run synchronously.
   * @return {string}             Template source string.
   */
  this.load = function (pathname, cb) {
    if (!fs || !fs.readFileSync) {
      throw new Error('Unable to find file ' + pathname + ' because there is no filesystem to read from.');
    }

    pathname = self.resolve(pathname);

    if (cb) {
      fs.readFile(pathname, self.encoding, cb);
      return;
    }
    return fs.readFileSync(pathname, self.encoding);
  };
};
