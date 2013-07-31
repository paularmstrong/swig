var fs = require('fs'),
  path = require('path'),
  _ = require('lodash'),
  _tags = require('./tags'),
  _filters = require('./filters'),
  parser = require('./parser');

var CACHE = {},
  defaultOptions = {
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

  _.each(['varControls', 'tagControls', 'cmtControls'], function (key) {
    if (!options.hasOwnProperty(key)) {
      return;
    }
    if (!_.isArray(options[key]) || options[key].length !== 2) {
      throw new Error('Option "' + key + '" must be an array containing 2 different control strings.');
    }
    if (options[key][0] === options[key][1]) {
      throw new Error('Option "' + key + '" open and close controls must not be the same.');
    }
    _.each(options[key], function (a, i) {
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

  var locals = _.extend({}, defaultOptions.locals, options.locals || {});

  _.extend(defaultOptions, options);
  defaultOptions.locals = locals;

  defaultInstance.options = _.extend(defaultInstance.options, options);
};

exports.Swig = function (opts) {
  validateOptions(opts);
  this.options = _.defaults(opts || {}, defaultOptions);
  this.cache = {};
  var self = this,
    tags = _tags,
    filters = _filters;

  function getLocals(options) {
    if (!options || !options.locals) {
      return self.options.locals;
    }

    return _.extend({}, self.options.locals, options.locals);
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

    var locals = getLocals(options);

    options = _.extend({}, self.options, _.omit(options, 'locals'));
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

  this.compile = function (source, options) {
    var key = options ? options.filename : null,
      cached = key ? cacheGet(key) : null,
      blocks = {},
      locals,
      tokens,
      tpl,
      parentFile,
      parent,
      parentName;

    if (cached) {
      return cached;
    }

    locals = getLocals(options);
    tokens = self.parse(source, options);
    parentName = tokens.parent;

    while (parentName) {
      if (!key) {
        throw new Error('Cannot extend "' + parentName + '" because current template has no filename.');
      }

      // TODO: do we need an alternate solution for in-browser?
      parentFile = path.resolve(path.dirname(key), parentName);
      parent = self.compileFile(parentFile, _.extend({}, options, { filename: parentFile }));
      blocks = _.extend({}, parent.blocks, blocks);
      parentName = parent.parent;
    }

    if (parent) {
      parent.blocks = blocks;
    }

    tpl = new Function('_swig', '_ctx', '_filters', '_', '_fn', [
      'with (_ctx) {',
      '  var _output = "";',
      parser.compile(tokens, parent, options),
      '  return _output;',
      '}'
    ].join('\n  '));
    function efn() { return ''; }

    function compiled(context) {
      return tpl(self, _.extend(context || {}, locals), filters, _, efn);
    }

    _.extend(compiled, tokens);

    if (key) {
      cacheSet(key, compiled);
    }

    return compiled;
  };

  this.compileFile = function (pathname, options) {
    var src;

    if (!options) {
      options = {};
    }

    pathname = (options.resolveFrom) ? path.resolve(path.dirname(options.resolveFrom), pathname) : pathname;
    src = fs.readFileSync(pathname, 'utf8');

    if (!options.filename) {
      options.filename = pathname;
    }
    return self.compile(src, options);
  };

  this.render = function (source, options) {
    var locals = getLocals(options);
    return exports.compile(source, options)(locals);
  };

  this.renderFile = function (path, options) {
    var src = fs.readFileSync(path, 'utf8');
    return self.render(src, options);
  };
};

defaultInstance = new exports.Swig();
exports.addFilter = defaultInstance.addFilter;
exports.addTag = defaultInstance.addTag;
exports.parse = defaultInstance.parse;
exports.parseFile = defaultInstance.parseFile;
exports.compile = defaultInstance.compile;
exports.compileFile = defaultInstance.compileFile;
exports.render = defaultInstance.render;
exports.invalidateCache = defaultInstance.invalidateCache;
