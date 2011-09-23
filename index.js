var fs = require('fs'),
    path = require('path'),

    tags = require('./lib/tags'),
    parser = require('./lib/parser'),
    filters = require('./lib/filters'),
    helpers = require('./lib/helpers'),

    _ = require('underscore'),

    config,
    CACHE = {};

// Call this before using the templates
exports.init = function (options) {
    config = _.extend({
        allowErrors: false,
        autoescape: true,
        encoding: 'utf8',
        root: '/',
    }, options);

    config.filters = _.extend(filters, options.filters);
    config.tags = _.extend(tags, options.tags);
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
    if (config.allowErrors) {
        template.tokens = parser.parse.call(template, data, config.tags, config.autoescape);
    } else {
        try {
            template.tokens = parser.parse.call(template, data, config.tags, config.autoescape);
        } catch (e) {
            return new TemplateError(e);
        }
    }

    // The raw template code
    code = parser.compile.call(template);

    // The compiled render function - this is all we need
    render = new Function('__context', '__parents', '__filters', '__escape',
        [  '__parents = __parents ? __parents.slice() : [];'
        // Prevents circular includes (which will crash node without warning)
        , 'var j = __parents.length,'
        , '    __output = [],'
        , '    __this = this;'
        // Note: this loop averages much faster than indexOf across all cases
        , 'while (j--) {'
        , '   if (__parents[j] === this.id) {'
        , '         return "Circular import of template " + this.id + " in " + __parents[__parents.length-1];'
        , '   }'
        , '}'
        // Add this template as a parent to all includes in its scope
        , '__parents.push(this.id);'
        , code
        , 'return __output.join("");'].join('')
    );

    template.render = function (context, parents) {
        if (config.allowErrors) {
            return render.call(this, context, parents, config.filters, helpers.escaper);
        } else {
            try {
                return render.call(this, context, parents, config.filters, helpers.escaper);
            } catch (e) {
                return new TemplateError(e);
            }
        }
    };

    return template;
}

/*
* Returns a template object from the given filepath.
* The filepath needs to be relative to the template directory.
*/
exports.fromFile = function (filepath) {
    if (filepath[0] === '/') {
        filepath = filepath.substr(1);
    }

    if (CACHE.hasOwnProperty(filepath)) {
        return CACHE[filepath];
    }

    var data = fs.readFileSync(config.root + '/' + filepath, config.encoding);

    // TODO: see what error readFileSync returns and warn about it
    if (data) {
        CACHE[filepath] = createTemplate(data, filepath);
        return CACHE[filepath];
    }
};

exports.fromString = function (string) {
    if (!CACHE.hasOwnProperty(string)) {
        CACHE[string] = createTemplate(string, string);
    }

    return CACHE[string];
};

exports.compile = function (source, options, callback) {
    var self = this;
    if (typeof source === 'string') {
        return function (options) {
            var tmpl = exports.fromString(source);
            return tmpl.render(options);
        };
    } else {
        return source;
    }
};

exports.render = function (template, options) {
    template = exports.compile(template, options);
    return template(options);
};
