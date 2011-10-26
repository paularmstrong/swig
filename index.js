var fs = require('fs'),
    path = require('path'),

    tags = require('./lib/tags'),
    parser = require('./lib/parser'),
    filters = require('./lib/filters'),
    helpers = require('./lib/helpers'),

    _ = require('underscore'),

    config = {
        allowErrors: false,
        autoescape: true,
        cache: true,
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
            compileFile: exports.compileFile,
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

exports.compileFile = function (filepath) {
    var tpl, get;

    if (filepath[0] === '/') {
        filepath = filepath.substr(1);
    }

    if (_config.cache && CACHE.hasOwnProperty(filepath)) {
        return CACHE[filepath];
    }

    if (typeof window !== 'undefined') {
        throw new TemplateError({ stack: 'You must pre-compile all templates in-browser. Use `swig.compile(template);`.' });
    }

    get = function () {
        var file = ((/^\//).test(filepath)) ? filepath : _config.root + '/' + filepath,
            data = fs.readFileSync(file, config.encoding);
        tpl = getTemplate(data, { filename: filepath });
    };

    if (_config.allowErrors) {
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
    options = options || {};
    var tmpl = getTemplate(source, options || {});

    return function (source, options) {
        return tmpl.render(source, options);
    };
};
