var fs = require('fs'),
  path = require('path'),
  utils = require('./utils'),
  _tags = require('./tags'),
  _filters = require('./filters'),
  parser = require('./parser');

var defaultOptions = {
    autoescape: true,
    varControls: ['{{', '}}'],
    tagControls: ['{%', '%}'],
    cmtControls: ['{#', '#}'],
    locals: {},
    cache: 'memory'
  },
  defaultInstance;

function validateOptions(options) {
  if (!options) {
    return;
  }

  utils.each(['varControls', 'tagControls', 'cmtControls'], function (key) {
    if (!options.hasOwnProperty(key)) {
      return;
    }
    if (!utils.isArray(options[key]) || options[key].length !== 2) {
      throw new Error('Option "' + key + '" must be an array containing 2 different control strings.');
    }
    if (options[key][0] === options[key][1]) {
      throw new Error('Option "' + key + '" open and close controls must not be the same.');
    }
    utils.each(options[key], function (a, i) {
      if (a.length < 2) {
        throw new Error('Option "' + key + '" ' + ((i) ? 'open ' : 'close ') + 'control must be at least 2 characters. Saw "' + a + '" instead.');
      }
    });
  });

  if (options.hasOwnProperty('cache')) {
    if (options.cache && options.cache !== 'memory') {
      if (!options.cache.get || !options.cache.set) {
        throw new Error('Invalid cache option ' + JSON.stringify(options.cache) + ' found. Expected "memory" or { get: function (key) { ... }, set: function (key, value) { ... } }.');
      }
    }
  }
}

/**
 * Set defaults for the base and all new Swig environments
 * @param  {object} options Swig options object
 * @return {undefined}
 * @api public
 */
exports.setDefaults = function (options) {
  validateOptions(options);

  var locals = utils.extend({}, defaultOptions.locals, options.locals || {});

  utils.extend(defaultOptions, options);
  defaultOptions.locals = locals;

  defaultInstance.options = utils.extend(defaultInstance.options, options);
};

/**
 * Create a new, separate Swig compile/render environment
 *
 * Examples:
 *
 *    var myswig = new swig.Swig({varControls: ['<%=', '%>']});
 *    myswig.render('Tacos are <%= tacos =>!', { locals: { tacos: 'delicious' }});
 *    // => Tacos are delicious!
 *    swig.render('Tacos are <%= tacos =>!', { locals: { tacos: 'delicious' }});
 *    // => 'Tacos are <%= tacos =>!'
 *
 * @param  {[type]} opts [description]
 * @return {[type]}      [description]
 * @api public
 */
exports.Swig = function (opts) {
  validateOptions(opts);
  this.options = utils.extend({}, defaultOptions, opts || {});
  this.cache = {};
  var self = this,
    tags = _tags,
    filters = _filters;

  /**
   * Get combined locals context
   * @param  {object} options Swig options object
   * @return {object}         Locals context
   * @api private
   */
  function getLocals(options) {
    if (!options || !options.locals) {
      return self.options.locals;
    }

    return utils.extend({}, self.options.locals, options.locals);
  }

  /**
   * Get compiled template from the cache
   * @param  {string} key           Name of template
   * @return {object|undefined}     Template function and tokens
   * @api private
   */
  function cacheGet(key) {
    if (!self.options.cache) {
      return;
    }

    if (self.options.cache === 'memory') {
      return self.cache[key];
    }

    return self.options.cache.get(key);
  }

  /**
   * Store a template in the cache
   * @param  {string} key Name of template
   * @param  {object} val Template function and tokens
   * @return {undefined}
   * @api private
   */
  function cacheSet(key, val) {
    if (!self.options.cache) {
      return;
    }

    if (self.options.cache === 'memory') {
      self.cache[key] = val;
      return;
    }

    self.options.cache.set(key, val);
  }

  /**
   * Clears the in-memory template cache.
   *
   * Examples:
   *
   *     swig.invalidateCache();
   *
   * @return {undefined}
   * @api public
   */
  this.invalidateCache = function () {
    if (self.options.cache === 'memory') {
      self.cache = {};
    }
  };

  /**
   * Add a custom filter for swig variables.
   *
   * @param {string} name
   * @param {function} method
   * @return {undefined}
   * @api public
   */
  this.addFilter = function (name, method) {
    // TODO: validate name and method
    filters[name] = method;
  };

  /**
   * Add a custom tag
   *
   * @param  {string} name      Tag name
   * @param  {function} parse   Method for parsing tokens
   * @param  {function} compile Method for compiling renderable output
   * @param  {boolean} ends     Does this require an end tag?
   * @return {undefined}
   * @api public
   */
  this.addTag = function (name, parse, compile, ends) {
    // TODO: validate parse, compile
    tags[name] = {
      parse: parse,
      compile: compile,
      ends: ends
    };
  };

  /**
   * Parse a given source string into tokens
   *
   * @param  {string} source
   * @param  {object} options
   * @return {object} parsed template tokens object
   * @api private
   */
  this.parse = function (source, options) {
    validateOptions(options);

    var locals = getLocals(options),
      opts = {},
      k;

    for (k in options) {
      if (options.hasOwnProperty(k) && k !== 'locals') {
        opts[k] = options[k];
      }
    }

    options = utils.extend({}, self.options, opts);
    options.locals = locals;

    return parser.parse(source, options, tags, filters);
  };

  /**
   * Parse a given file into tokens
   *
   * @param  {string} pathname  Full path to file to parse
   * @param  {object} options   Swig options object
   * @return {object} parsed    Template tokens object
   * @api private
   */
  this.parseFile = function (pathname, options) {
    var src;

    if (!options) {
      options = {};
    }

    pathname = (options.resolveFrom) ? path.resolve(path.dirname(options.resolveFrom), pathname) : pathname;
    src = fs.readFileSync(pathname, 'utf8');

    if (!options.filename) {
      options.filename = pathname;
    }

    return self.parse(src, options);
  };

  /**
   * Recursively compile and get parents of given parsed token object
   *
   * @param  {object} tokens  Parsed tokens from template
   * @param  {object} options  Swig options object
   * @return {object}         Parsed tokens from parent templates
   * @api private
   */
  function getParents(tokens, options) {
    var blocks = {},
      parentName = tokens.parent,
      parentFile,
      parent;

    while (parentName) {
      if (!options || !options.filename) {
        throw new Error('Cannot extend "' + parentName + '" because current template has no filename.');
      }

      // TODO: do we need an alternate solution for in-browser?
      parentFile = path.resolve(path.dirname(options.filename), parentName);
      parent = self.compileFile(parentFile, utils.extend({}, options, { filename: parentFile }));
      blocks = utils.extend({}, parent.blocks, blocks);
      parentName = parent.parent;
    }

    if (parent) {
      parent.blocks = blocks;
    }

    return parent;
  }

  /**
   * Pre-compile a source string into a cache-able template function
   *
   * @param  {string} source  Template source string
   * @param  {object} options Swig options object
   * @return {object}         Renderable funcction and tokens
   * @api public
   */
  this.precompile = function (source, options) {
    var tokens,
      tpl,
      parent;

    tokens = self.parse(source, options);
    parent = getParents(tokens, options);

    tpl = new Function('_swig', '_ctx', '_filters', 'utils', '_fn', [
      '  var _output = "";',
      parser.compile(tokens, parent, options),
      '  return _output;',
    ].join('\n  '));

    return { tpl: tpl, tokens: tokens };
  };

  /**
   * Compile string source into a renderable template function
   *
   * @param  {string} source  Template source string
   * @param  {object} options Swig options object
   * @return {function}
   * @api public
   */
  this.compile = function (source, options) {
    var key = options ? options.filename : null,
      cached = key ? cacheGet(key) : null,
      locals,
      pre,
      tpl;

    if (cached) {
      return cached;
    }

    locals = getLocals(options);
    pre = this.precompile(source, options);

    function efn() { return ''; }
    function compiled(context) {
      return pre.tpl(self, utils.extend({}, locals, context || {}), filters, utils, efn);
    }

    utils.extend(compiled, pre.tokens);

    if (key) {
      cacheSet(key, compiled);
    }

    return compiled;
  };

  /**
   * Compile a source file into a renderable template function
   *
   * @param  {string} pathname File location
   * @param  {object} options  Swig options object
   * @return {function}
   * @api public
   */
  this.compileFile = function (pathname, options) {
    var src, cached;

    if (!options) {
      options = {};
    }

    pathname = (options.resolveFrom) ? path.resolve(path.dirname(options.resolveFrom), pathname) : pathname;
    if (!options.filename) {
      options.filename = pathname;
    }
    cached = cacheGet(pathname);

    if (cached) {
      return cached;
    }

    src = fs.readFileSync(pathname, 'utf8');

    return self.compile(src, options);
  };

  /**
   * Compile and render a template string for final output
   *
   * @param  {string} source  Template source string
   * @param  {object} options Swig options object
   * @return {string}         Rendered output
   */
  this.render = function (source, options) {
    return exports.compile(source, options)();
  };

  /**
   * Compile and render a template file for final output
   *
   * Examples:
   *
   *    swig.renderFile('./template.html', {}, function (err, output) {
   *      if (err) {
   *        throw err;
   *      }
   *      console.log(output);
   *    });
   *
   *    swig.renderFile('./template.html', {});
   *    // => output
   *
   * @param  {string}   source  File location
   * @param  {object}   options Swig options object
   * @param  {Function} fn      Optional callback function
   * @return {string}           Rendered output
   * @api public
   */
  this.renderFile = function (source, options, fn) {
    var out;
    try {
      out = exports.compileFile(source, options)();
      if (fn) {
        fn(null, out);
        return;
      }
    } catch (e) {
      if (fn) {
        fn(e);
        return;
      }
      throw e;
    }
    return out;
  };
};

/*!
 * Export methods publicly
 */
defaultInstance = new exports.Swig();
exports.addFilter = defaultInstance.addFilter;
exports.addTag = defaultInstance.addTag;
exports.parseFile = defaultInstance.parseFile;
exports.precompile = defaultInstance.precompile;
exports.compile = defaultInstance.compile;
exports.compileFile = defaultInstance.compileFile;
exports.render = defaultInstance.render;
exports.renderFile = defaultInstance.renderFile;
exports.invalidateCache = defaultInstance.invalidateCache;
