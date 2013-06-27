var fs = require('fs'),
  path = require('path'),

  tags = require('./tags'),
  parser = require('./parser'),
  filters = require('./filters'),
  helpers = require('./helpers'),
  dateformat = require('./dateformat'),

  _ = require('underscore');

var config = {
    allowErrors: false,
    autoescape: true,
    cache: true,
    encoding: 'utf8',
    filters: filters,
    root: '/',
    tags: tags,
    extensions: {},
    tzOffset: 0
  },
  _config = _.extend({}, config),
  CACHE = {};

// Call this before using the templates
exports.init = function (options) {
  CACHE = {};
  _config = _.extend({}, config, options);
  _config.filters = _.extend(filters, options.filters);
  _config.tags = _.extend(tags, options.tags);

  dateformat.defaultTZOffset = _config.tzOffset;
};

function TemplateError(error) {
  return { render: function () {
    return '<pre>' + error.stack + '</pre>';
  }};
}

function createRenderFunc(code) {
  // The compiled render function - this is all we need
  return new Function('_context', '_parents', '_filters', '_', '_ext', [
    '_parents = _parents ? _parents.slice() : [];',
    '_context = _context || {};',
    // Prevents circular includes (which will crash node without warning)
    'var j = _parents.length,',
    '  _output = "",',
    '  _this = this;',
    // Note: this loop averages much faster than indexOf across all cases
    'while (j--) {',
    '   if (_parents[j] === this.id) {',
    '     return "Circular import of template " + this.id + " in " + _parents[_parents.length-1];',
    '   }',
    '}',
    // Add this template as a parent to all includes in its scope
    '_parents.push(this.id);',
    code,
    'return _output;'
  ].join(''));
}

function createTemplate(data, id) {
  var template = {
      // Allows us to include templates from the compiled code
      compileFile: exports.compileFile,
      // These are the blocks inside the template
      blocks: {},
      // Distinguish from other tokens
      type: parser.TEMPLATE,
      // The template ID (path relative to template dir)
      id: id
    },
    tokens,
    code,
    render;

  // The template token tree before compiled into javascript
  if (_config.allowErrors) {
    tokens = parser.parse.call(template, data, _config.tags, _config.autoescape);
  } else {
    try {
      tokens = parser.parse.call(template, data, _config.tags, _config.autoescape);
    } catch (e) {
      return new TemplateError(e);
    }
  }

  template.tokens = tokens;

  // The raw template code
  code = parser.compile.call(template);

  if (code !== false) {
    render = createRenderFunc(code);
  } else {
    render = function (_context, _parents, _filters, _, _ext) {
      template.tokens = tokens;
      code = parser.compile.call(template, '', _context);
      var fn = createRenderFunc(code);
      return fn.call(this, _context, _parents, _filters, _, _ext);
    };
  }

  template.render = function (context, parents) {
    if (_config.allowErrors) {
      return render.call(this, context, parents, _config.filters, _, _config.extensions);
    }
    try {
      return render.call(this, context, parents, _config.filters, _, _config.extensions);
    } catch (e) {
      return new TemplateError(e);
    }
  };

  return template;
}

function getTemplate(source, options) {
  var key = options.filename || source;
  if (_config.cache || options.cache) {
    if (!CACHE.hasOwnProperty(key)) {
      CACHE[key] = createTemplate(source, key);
    }

    return CACHE[key];
  }

  return createTemplate(source, key);
}

exports.compileFile = function (filepath, forceAllowErrors) {
  var tpl, get;

  if (_config.cache && CACHE.hasOwnProperty(filepath)) {
    return CACHE[filepath];
  }

  if (typeof window !== 'undefined') {
    throw new TemplateError({ stack: 'You must pre-compile all templates in-browser. Use `swig.compile(template);`.' });
  }

  get = function () {
    var excp,
      getSingle,
      c;
    getSingle = function (prefix) {
      var file = ((/^\//).test(filepath) || (/^.:/).test(filepath)) ? filepath : prefix + '/' + filepath,
        data;
      try {
        data = fs.readFileSync(file, config.encoding);
        tpl = getTemplate(data, { filename: filepath });
      } catch (e) {
        excp = e;
      }
    };
    if (typeof _config.root === "string") {
      getSingle(_config.root);
    }
    if (_config.root instanceof Array) {
      c = 0;
      while (tpl === undefined && c < _config.root.length) {
        getSingle(_config.root[c]);
        c = c + 1;
      }
    }
    if (tpl === undefined) {
      throw excp;
    }
  };

  if (_config.allowErrors || forceAllowErrors) {
    get();
  } else {
    try {
      get();
    } catch (error) {
      tpl = new TemplateError(error);
    }
  }
  return tpl;
};

exports.compile = function (source, options) {
  var tmpl = getTemplate(source, options || {});

  return function (source, options) {
    return tmpl.render(source, options);
  };
};
