var fs = require('fs'),
    path = require('path'),

    tags = require('./lib/tags'),
    parser = require('./lib/parser'),
    filters = require('./lib/filters'),
    helpers = require('./lib/helpers'),
    dateformat = require('./lib/dateformat'),

    _ = require('underscore'),

    config = {
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

function createTemplate(data, id, conf) {
    var template = {
            // Allows us to include templates from the compiled code
            compileFile: function (filepath) {
                return exports.compileFile(filepath, conf);
            },
            // These are the blocks inside the template
            blocks: {},
            // Distinguish from other tokens
            type: parser.TEMPLATE,
            // The template ID (path relative to tempalte dir)
            id: id
        },
        tokens,
        code,
        render;

    // The template token tree before compiled into javascript
    if (conf.allowErrors) {
        template.tokens = parser.parse.call(template, data, conf.tags, conf.autoescape);
    } else {
        try {
            template.tokens = parser.parse.call(template, data, conf.tags, conf.autoescape);
        } catch (e) {
            return new TemplateError(e);
        }
    }

    // The raw template code
    code = parser.compile.call(template);

    // The compiled render function - this is all we need
    render = new Function('_context', '_parents', '_filters', '_', '_ext', [
        '_parents = _parents ? _parents.slice() : [];',
        '_context = _context || {};',
        // Prevents circular includes (which will crash node without warning)
        'var j = _parents.length,',
        '    _output = "",',
        '    _this = this;',
        // Note: this loop averages much faster than indexOf across all cases
        'while (j--) {',
        '   if (_parents[j] === this.id) {',
        '         return "Circular import of template " + this.id + " in " + _parents[_parents.length-1];',
        '   }',
        '}',
        // Add this template as a parent to all includes in its scope
        '_parents.push(this.id);',
        code,
        'return _output;',
    ].join(''));

    template.render = function (context, parents) {
        if (conf.allowErrors) {
            return render.call(this, context, parents, conf.filters, _, conf.extensions);
        }
        try {
            return render.call(this, context, parents, conf.filters, _, conf.extensions);
        } catch (e) {
            return new TemplateError(e);
        }
    };

    return template;
}

function getTemplate(source, options, conf) {
    var key = options.filename || source,
        cache = conf.CACHE || CACHE;
    if (conf.cache || options.cache) {
        if (!cache.hasOwnProperty(key)) {
            cache[key] = createTemplate(source, key, conf);
        }

        return cache[key];
    }

    return createTemplate(source, key, conf);
}

exports.compileFile = function (filepath, conf) {
    conf = conf || _config;
    var tpl, get,
        cache = conf.CACHE || CACHE;

    if (filepath[0] === '/') {
        filepath = filepath.substr(1);
    }

    if (conf.cache && cache.hasOwnProperty(filepath)) {
        return cache[filepath];
    }

    if (typeof window !== 'undefined') {
        throw new TemplateError({ stack: 'You must pre-compile all templates in-browser. Use `swig.compile(template);`.' });
    }

    get = function () {
        var file = ((/^\//).test(filepath) || (/^.:/).test(filepath)) ? filepath : conf.root + '/' + filepath,
            data = fs.readFileSync(file, conf.encoding);
        tpl = getTemplate(data, { filename: filepath }, conf);
    };

    if (conf.allowErrors) {
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

exports.compile = function (source, options, conf) {
    conf = conf || _config;
    options = options || {};
    var tmpl = getTemplate(source, options, conf);

    return function (source, options) {
        var rv = tmpl.render(source, options);
        return rv;
    };
};

exports.engine = function (localConfig) {
    localConfig = _.extend({}, _config, localConfig);
    localConfig.filters = _.extend({}, _config.filters, localConfig.filters);
    localConfig.tags = _.extend({}, _config.tags, localConfig.tags);
    localConfig.CACHE = {};

    var engine = {
        compileFile: function (filepath) {
            return exports.compileFile(filepath, localConfig);
        },
        compile: function (source, options) {
            return exports.compile(source, options, localConfig);
        }
    };

    return engine;
};
