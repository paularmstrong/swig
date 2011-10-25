var fs = require('fs'),
    path = require('path'),

    tags = require('./lib/tags'),
    parser = require('./lib/parser'),
    filters = require('./lib/filters'),
    helpers = require('./lib/helpers'),

    _ = require('underscore');

var config = {
        allowErrors: false,
        autoescape: true,
        encoding: 'utf8',
        filters: filters,
        root: '/',
        tags: tags
    },
    _config = _.extend({}, config),
    CACHE = {};

// Call this before using the templates
exports.init = function (options) {
    CACHE = {};
    _config = _.extend({}, config, options);
    _config.filters = _.extend(filters, options.filters);
    _config.tags = _.extend(tags, options.tags);
};

function TemplateError(error) {
    return { render: function () {
        return '<pre>' + error.stack + '</pre>';
    }};
}

function createTemplate(data, id) {
    var template = {
            // Allows us to include templates from the compiled code
            fromFile: exports.fromFile,
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
    if (_config.allowErrors) {
        template.tokens = parser.parse.call(template, data, _config.tags, _config.autoescape);
    } else {
        try {
            template.tokens = parser.parse.call(template, data, _config.tags, _config.autoescape);
        } catch (e) {
            return new TemplateError(e);
        }
    }

    // The raw template code
    code = parser.compile.call(template);

    // The compiled render function - this is all we need
    render = new Function('__context', '__parents', '__filters', '_', [
        '__parents = __parents ? __parents.slice() : [];',
        // Prevents circular includes (which will crash node without warning)
        'var j = __parents.length,',
        '    __output = "",',
        '    __this = this;',
        // Note: this loop averages much faster than indexOf across all cases
        'while (j--) {',
        '   if (__parents[j] === this.id) {',
        '         return "Circular import of template " + this.id + " in " + __parents[__parents.length-1];',
        '   }',
        '}',
        // Add this template as a parent to all includes in its scope
        '__parents.push(this.id);',
        code,
        'return __output;',
    ].join(''));

    template.render = function (context, parents) {
        if (_config.allowErrors) {
            return render.call(this, context, parents, _config.filters, _);
        } else {
            try {
                return render.call(this, context, parents, _config.filters, _);
            } catch (e) {
                return new TemplateError(e);
            }
        }
    };

    return template;
}

exports.fromFile = function (filepath) {
    if (filepath[0] === '/') {
        filepath = filepath.substr(1);
    }

    if (CACHE.hasOwnProperty(filepath)) {
        return CACHE[filepath];
    }

    if (typeof window !== 'undefined') {
        throw new TemplateError({ stack: 'You must pre-compile all templates in-browser. Use `swig.compile(template);`.' });
    }

    var get = function () {
        var file = ((/^\//).test(filepath)) ? filepath : _config.root + '/' + filepath,
            data = fs.readFileSync(file, config.encoding);
        CACHE[filepath] = createTemplate(data, filepath);
    };

    if (_config.allowErrors) {
        get();
    } else {
        try {
            get();
        } catch (error) {
            CACHE[filepath] = new TemplateError(error);
        }
    }
    return CACHE[filepath];
};

function getTemplate(source, name) {
    var key = name || source;
    if (!CACHE.hasOwnProperty(key)) {
        CACHE[key] = createTemplate(source, key);
    }

    return CACHE[key];
}

exports.fromString = function (string, name) {
    console.warn('[WARNING] "swig.fromString" is deprecated. Use "swig.compile" instead.');
    return getTemplate(string, name);
};

exports.compile = function (source, options) {
    options = options || {};
    var tmpl = getTemplate(source, options.filename || null);

    return function (source, options) {
        return tmpl.render(source, options);
    };
};

exports.render = function (source, options) {
    var template = exports.compile(source, options);
    return template(options.locals || {});
};
