var fs = require('fs'),
  path = require('path');

/**
 * Loaders are responsible for loading templates from a resource such as the file system.
 */


/**
 * Loads templates from the file system.
 * @class
 * @param {string}   searchpath     Path to the templates as string.
 * @param {string}   encoding       Template encoding ('utf8' by default).
 */
function FileSystemLoader(searchpath, encoding) {
  this.searchpath = searchpath;
  this.encoding = encoding || 'utf8';
  var self = this;

  /**
   * Resolves <var>to</var> to an absolute path.
   * @param  {string} from      Base directory path.
   * @param  {string}           File path to be resolved.
   * @return {string}
   */
  this.resolve = function (from, to) {
    if (!to && from) {
      to = from;
      from = null;
    }

    from = from || self.searchpath;
    to = (from) ? path.resolve(path.dirname(from), to) : to;
    return to;
  };

  /**
   * Loads a single template.
   * @param  {string} pathname  Path to template file.
   * @param  {function} [cb]    Asynchronous callback function. If not provided, will run synchronously.
   * @return {string}           Template source string.
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
}

exports.FileSystemLoader = FileSystemLoader;

/**
 * Loads templates from the given hash.
 * @class
 * @param {string}   mapping     Hash object with template paths as keys and template sources as values.
 */
function MemoryLoader(mapping) {
  this.mapping = mapping;
  var self = this;

  /**
   * Resolves <var>to</var> to an absolute path.
   * @param  {string} from      Base directory path.
   * @param  {string}           File path to be resolved.
   * @return {string}
   */
  this.resolve = function (from, to) {
    if (!to && from) {
      to = from;
      from = null;
    }
    return to;
  };

  /**
   * Loads a single template.
   * @param  {string} pathname  Path to template file.
   * @param  {function} [cb]    Asynchronous callback function. If not provided, will run synchronously.
   * @return {string}           Template source string.
   */
  this.load = function (pathname, cb) {
    var src;

    pathname = self.resolve(pathname);

    src = self.mapping[pathname];
    if (!src) {
      throw new Error('Unable to find template ' + pathname + '.');
    }

    if (cb) {
      cb(null, src);
      return;
    }
    return src;
  };
}

exports.MemoryLoader = MemoryLoader;