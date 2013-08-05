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

exports.setDefaults = function (options) {
  validateOptions(options);

  var locals = utils.extend({}, defaultOptions.locals, options.locals || {});

  utils.extend(defaultOptions, options);
  defaultOptions.locals = locals;

  defaultInstance.options = utils.extend(defaultInstance.options, options);
};

exports.Swig = function (opts) {
  validateOptions(opts);
  this.options = utils.extend({}, defaultOptions, opts || {});
  this.cache = {};
  var self = this,
    tags = _tags,
    filters = _filters;

  function getLocals(options) {
    if (!options || !options.locals) {
      return self.options.locals;
    }

    return utils.extend({}, self.options.locals, options.locals);
  }

  function cacheGet(key) {
    if (!self.options.cache) {
      return;
    }

    if (self.options.cache === 'memory') {
      return self.cache[key];
    }

    return self.options.cache.get(key);
  }

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

  this.invalidateCache = function () {
    if (self.options.cache === 'memory') {
      self.cache = {};
    }
  };

  this.addFilter = function (name, method) {
    // TODO: validate name and method
    filters[name] = method;
  };

  this.addTag = function (name, parse, compile, ends) {
    // TODO: validate parse, compile
    tags[name] = {
      parse: parse,
      compile: compile,
      ends: ends
    };
  };

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

  function getParents(options, tokens) {
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

  this.precompile = function (source, options) {
    var tokens,
      tpl,
      parent;

    tokens = self.parse(source, options);
    parent = getParents(options, tokens);

    tpl = new Function('_swig', '_ctx', '_filters', 'utils', '_fn', [
      '  var _output = "";',
      parser.compile(tokens, parent, options),
      '  return _output;',
    ].join('\n  '));

    return { tpl: tpl, tokens: tokens };
  };

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

  this.render = function (source, options) {
    var locals = getLocals(options);
    return exports.compile(source, options)(locals);
  };
};

defaultInstance = new exports.Swig();
exports.addFilter = defaultInstance.addFilter;
exports.addTag = defaultInstance.addTag;
exports.parse = defaultInstance.parse;
exports.parseFile = defaultInstance.parseFile;
exports.precompile = defaultInstance.precompile;
exports.compile = defaultInstance.compile;
exports.compileFile = defaultInstance.compileFile;
exports.render = defaultInstance.render;
exports.invalidateCache = defaultInstance.invalidateCache;
