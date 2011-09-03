var fs = require('fs'),
    util = require('util'),
    path = require('path'),
    crypto = require('crypto'),

    tags = require('./lib/tags'),
    parser = require('./lib/parser'),
    filters = require('./lib/filters'),
    helpers = require('./lib/helpers'),

    _ = require('underscore'),

    config,

    CACHE = {},

    fromString, fromFile, createTemplate;

// Call this before using the templates
exports.init = function (options) {
    config = _.extend({
        autoescape: true,
        root: '/',
        debug: false
    }, options);

    config.filters = _.extend(filters, options.filters);
    config.tags = _.extend(tags, options.tags);
};

createTemplate = function (data, id) {
    var template = {
            // Allows us to include templates from the compiled code
            fromFile: fromFile,
            // These are the blocks inside the template
            blocks: {},
            // Distinguish from other tokens
            type: parser.TEMPLATE,
            // Allows us to print debug info from the compiled code
            util: util,
            // The template ID (path relative to tempalte dir)
            id: id
        },
        tokens,
        code,
        render;

    // The template token tree before compiled into javascript
    template.tokens = parser.parse.call(template, data, config.tags, config.autoescape);

    // The raw template code - can be inserted into other templates
    // We don't need this in production
    code = parser.compile.call(template);

    if (config.debug) {
        template.code = code;
    }

    // The compiled render function - this is all we need
    render = new Function('__context', '__parents', '__filters', '__escape',
        [  '__parents = __parents ? __parents.slice() : [];'
        // Prevents circular includes (which will crash node without warning)
        , 'for (var i=0, j=__parents.length; i<j; ++i) {'
        , '   if (__parents[i] === this.id) {'
        , '     return "Circular import of template " + this.id + " in " + __parents[__parents.length-1];'
        , '   }'
        , '}'
        // Add this template as a parent to all includes in its scope
        , '__parents.push(this.id);'
        , 'var __output = [];'
        , 'var __this = this;'
        , code
        , 'return __output.join("");'].join('\n')
    );

    template.render = function (context, parents) {
        return render.call(this, context, parents, config.filters, helpers.escaper);
    };

    return template;
};

/*
* Returns a template object from the given filepath.
* The filepath needs to be relative to the template directory.
*/
fromFile = function (filepath) {

    if (filepath[0] === '/') {
        filepath = filepath.substr(1);
    }

    if (filepath in CACHE && !config.debug) {
        return CACHE[filepath];
    }

    var data = fs.readFileSync(config.root + '/' + filepath, 'utf8');
    // TODO: see what error readFileSync returns and warn about it
    if (data) {
        CACHE[filepath] = createTemplate(data, filepath);
        return CACHE[filepath];
    }
};

/*
* Returns a template object from the given string.
*/
fromString = function (string) {
    var hash = crypto.createHash('md5').update(string).digest('hex');

    if (!(hash in CACHE && !config.debug)) {
        CACHE[hash] = createTemplate(string, hash);
    }

    return CACHE[hash];
};

module.exports = {
    init: exports.init,
    fromFile: fromFile,
    fromString: fromString,
    compile: function (source, options, callback) {
        var self = this;
        if (typeof source === 'string') {
            return function (options) {
                var tmpl = fromString(source);

                options.locals = options.locals || {};
                options.partials = options.partials || {};

                if (options.body) { // for express.js > v1.0
                    options.locals.body = options.body;
                }

                return tmpl.render(options.locals);
            };
        } else {
            return source;
        }
    },
    render: function (template, options) {
        template = this.compile(template, options);
        return template(options);
    }
};