var helpers = require('./helpers'),
    filters = require('./filters'),

    check   = helpers.check,

    variableRegexp  = /^\{\{.*?\}\}$/,
    logicRegexp     = /^\{%.*?%\}$/,
    commentRegexp   = /^\{#.*?#\}$/,

    TEMPLATE = exports.TEMPLATE = 0,
    LOGIC_TOKEN = 1,
    VAR_TOKEN   = 2;

exports.TOKEN_TYPES = {
    TEMPLATE: TEMPLATE,
    LOGIC: LOGIC_TOKEN,
    VAR: VAR_TOKEN
};

exports.parse = function (data, tags) {
    var rawtokens = data.trim().replace(/(^\n+)|(\n+$)/, "").split(/(\{%.*?%\}|\{\{.*?\}\}|\{#.*?#\})/),
        stack = [[]],
        index = 0,
        i = 0, j = rawtokens.length,
        filters = [], filter_name,
        varname, token, parts, part, names, matches, tagname;

    for (i, j; i < j; i += 1) {
        token = rawtokens[i];

        // Ignore empty strings and comments
        if (token.length === 0 || commentRegexp.test(token)) {
            continue;
        } else if (/^(\s|\n)+$/.test(token)) {
            token = token.replace(/ +/, " ").replace(/\n+/, "\n");
        } else if (variableRegexp.test(token)) {
            filters = [];
            parts = token.replace(/^\{\{ *| *\}\}$/g, '').split('|');
            varname = parts.shift();

            for (part in parts) {
                if (parts.hasOwnProperty(part)) {
                    part = parts[part];
                    filter_name = part.match(/^\w+/);
                    if (/\(/.test(part)) {
                        filters.push({ name: filter_name[0], args: part.replace(/^\w+\(|\'|\"|,|\)$/g, '').split(' ') });
                    } else {
                        filters.push({ name: filter_name[0], args: [] });
                    }
                }
            }

            token = {
                type: VAR_TOKEN,
                name: varname,
                filters: filters
            };
        } else if (logicRegexp.test(token)) {
            parts = token.replace(/^\{% *| *%\}$/g, "").split(" ");
            tagname = parts.shift();

            if (tagname === 'end') {
                stack.pop();
                index--;
                continue;
            }

            if (!(tagname in tags)) {
                throw new Error("Unknown logic tag: " + tagname);
            }

            token = {
                type: LOGIC_TOKEN,
                name: tagname,
                args: parts.length ? parts : [],
                compile: tags[tagname]
            };

            if (tags[tagname].ends) {
                stack[index].push(token);
                stack.push(token.tokens = []);
                index++;
                continue;
            }
        }

        // Everything else is treated as a string
        stack[index].push(token);
    }

    if (index !== 0) {
        throw new Error('Some tags have not been closed');
    }

    return stack[index];
};

function wrapFilter(variable, filter) {
    var output = variable,
        args;

    if (filters.hasOwnProperty(filter.name)) {
        args = [variable];
        if (filter.args.length) {
            args.push(filters.args);
        }
        output = '__filters.' + filter.name + '.apply(this, [' + args.toString() + '])';
    }

    return output;
}

function wrapFilters(variable, filters, context) {
    var output = helpers.escape(variable, context);

    if (filters && filters.length > 0) {
        filters.forEach(function (filter) {
            output = wrapFilter(output, filter);
        });
    }

    return output;
}

exports.compile = function compile(indent) {
    var code = [''],
        tokens = [],
        parent, filepath, blockname, varOutput;

    indent = indent || '';

    // Precompile - extract blocks and create hierarchy based on 'extends' tags
    // TODO: make block and extends tags accept context variables
    if (this.type === TEMPLATE) {
        this.tokens.forEach(function (token, index) {
            // TODO: Check for circular extends
            // Load the parent template
            if (token.name === 'extends') {
                filepath = token.args[0];
                if (!helpers.isStringLiteral(filepath) || token.args.length > 1) {
                    throw new Error("Extends tag accepts exactly one strings literal as an argument.");
                }
                if (index > 0) {
                    throw new Error("Extends tag must be the first tag in the template.");
                }
                token.template = this.fromFile(filepath.replace(/['"]/g, ''));
            } else if (token.name === 'block') { // Make a list of blocks
                blockname = token.args[0];
                if (!helpers.isValidBlockName(blockname) || token.args.length > 1) {
                    throw new Error("Invalid block tag syntax.");
                }
                if (this.type !== TEMPLATE) {
                    throw new Error("Block tag found inside another tag.");
                }
                this.blocks[blockname] = compile.call(token, indent + '  ');
            }
            tokens.push(token);
        }, this);

        if (tokens[0].name === 'extends') {
            parent = tokens[0].template;
            this.blocks = helpers.merge(parent.blocks, this.blocks);
            this.tokens = parent.tokens;
        }
    }

    // If this is not a template then just iterate through its tokens
    this.tokens.forEach(function (token, index) {
        if (typeof token === 'string') {
            return code.push('__output.push("' + token.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/"/g, '\\"') + '");');
        }

        if (typeof token !== 'object') {
            return; // Tokens can be either strings or objects
        }

        if (token.type === VAR_TOKEN) {
            varOutput = token.name;
            return code.push(
                'if (' + check(varOutput) + ') {'
                , '   __output.push(' + wrapFilters(varOutput, token.filters) + ');'
                , '} else if (' + check(varOutput, '__context') + ') {'
                , '   __output.push(' + wrapFilters(varOutput, token.filters, '__context') + ');'
                , '}'
            );
        }

        if (token.type !== LOGIC_TOKEN) {
            return; // Tokens can be either VAR_TOKEN or LOGIC_TOKEN
        }

        if (token.name === 'extends') {
            if (this.type !== TEMPLATE) {
                throw new Error("Extends tag must be the first tag in the template.");
            }
        } else if (token.name === 'block') {
            if (this.type !== TEMPLATE) {
                throw new Error("You can not nest block tags into other tags.");
            }

            code.push(this.blocks[token.args[0]]); // Blocks are already compiled in the precompile part
        } else {
            code.push(token.compile(indent + '  '));
        }

    }, this);

    return code.join("\n" + indent);
};