var helpers = require('./helpers'),
    filters = require('./filters'),
    _ = require('underscore'),

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

function getMethod(input) {
    return input.match(/^[\w\.]+/)[0];
}

function getArgs(input) {
    var parts = input.replace(/^\w+\(|\)$/g, '').split(','),
        l = parts.length,
        i = 0,
        part = '',
        partial = null,
        out = [];

    function singleToDoubleQuote(value) {
        return value.replace(/^\'|\'$/g, '"');
    }

    for (; i < l; i += 1) {
        part = parts[i];

        // Array
        if ((/^\[/).test(part) && !(/\]$/).test(part)) {
            partial = [part.replace('[', '').replace(/^\s+|\s+$/g, '')];
            continue;
        }
        if (_.isArray(partial)) {
            partial.push(part.replace(/\]$/, '').replace(/^\s+|\s+$/g, ''));
            if (!(/\]$/).test(part)) {
                continue;
            }
            part = partial;
            partial = null;
        }

        // Object
        if ((/^\{/).test(part)) {
            partial = part.replace(/^\{|\}$/g, '');
            partial = eval('a = {' + partial + '}');
            if ((/\}$/).test(part)) {
                part = partial;
                partial = null;
            } else {
                continue;
            }
        }
        if (typeof partial === 'object' && partial) {
            partial = eval('a = {' + JSON.stringify(partial).replace(/^\{|\}$/g, '') + ', ' + part.replace(/^\{|\}$/g, '') + '}');
            if (!(/\}$/).test(part)) {
                continue;
            }
            part = partial;
            partial = null;
        }

        // String
        if (partial === null && typeof part === 'string') {
            part = part.replace(/^\s+/, '');
        }

        // Huge hack to make arguments === ',' work correctly
        if ((partial !== '"' && part === '"') || (partial !== "'" && part === "'")) {
            partial = part;
            continue;
        } else if ((partial === '"' && part === '"') || (partial === "'" && part === "'")) {
            part = ',';
            partial = null;
        }

        if ((/^\"|^\'/).test(part) && (part.length === 1 || !(/\"$|\'$/).test(part))) {
            partial = part.replace(/^\'|^\"|^\s+/, '');
            continue;
        }
        if (typeof partial === 'string') {
            partial += ',' + part.replace(/\s+$/, '');
            if (!(/\"$|\'$/).test(partial)) {
                continue;
            }
            part = partial.replace(/\"$|\'$/, '');
            partial = null;
        }

        if (partial === null) {
            if (_.isArray(part)) {
                out.push(_.map(part, singleToDoubleQuote));
            } else if (typeof part === 'object') {
                out.push(part);
            } else {
                out.push(singleToDoubleQuote(part));
            }
        }
    }

    return out;
}

exports.parseVariable = function (token, escape) {
    if (!token) {
        return {
            type: null,
            name: '',
            filters: [],
            escape: escape
        };
    }

    var filters = [],
        parts = token.replace(/^\{\{ *| *\}\}$/g, '').split('|'),
        varname = parts.shift(),
        i = 0,
        l = parts.length,
        args = null,
        filter_name,
        part;

    if ((/\(/).test(varname)) {
        args = getArgs(varname.replace(/^\w+\./, ''));
        varname = getMethod(varname);
    }

    for (; i < l; i += 1) {
        part = parts[i];
        filter_name = getMethod(part);
        if (/\(/.test(part)) {
            filters.push({
                name: filter_name,
                args: getArgs(part)
            });
        } else {
            filters.push({ name: filter_name, args: [] });
        }
    }

    return {
        type: VAR_TOKEN,
        name: varname,
        args: args,
        filters: filters,
        escape: escape
    };
};

exports.parse = function (data, tags, autoescape) {
    var rawtokens = data.replace(/(^\s+)|(\s+$)/g, '').split(/(\{%.*?%\}|\{\{.*?\}\}|\{#.*?#\})/),
        escape = !!autoescape,
        last_escape = escape,
        stack = [[]],
        index = 0,
        i = 0,
        j = rawtokens.length,
        filters = [],
        filter_name,
        varname,
        token,
        parts,
        part,
        names,
        matches,
        tagname,
        lines = 1,
        curline = 1,
        newlines = null,
        lastToken;

    for (; i < j; i += 1) {
        token = rawtokens[i];
        curline = lines;
        newlines = token.match(/\n/g);
        if (newlines) {
            lines += newlines.length;
        }

        // Ignore empty strings and comments
        if (token.length === 0 || commentRegexp.test(token)) {
            continue;
        } else if (/^(\s|\n)+$/.test(token)) {
            token = token.replace(/ +/, ' ').replace(/\n+/, '\n');
        } else if (variableRegexp.test(token)) {
            token = exports.parseVariable(token, escape);
        } else if (logicRegexp.test(token)) {
            parts = token.replace(/^\{% *| *%\}$/g, '').split(' ');
            tagname = parts.shift();

            if (index > 0 && (/^end/).test(tagname)) {
                lastToken = _.last(stack[stack.length - 2]);
                if ('end' + lastToken.name === tagname) {
                    if (_.last(stack).name === 'autoescape') {
                        escape = last_escape;
                    }
                    stack.pop();
                    index -= 1;
                    continue;
                }

                throw new Error('Expected end tag for "' + lastToken.name + '", but found "' + tagname + '" at line ' + lines + '.');
            }

            if (!tags.hasOwnProperty(tagname)) {
                throw new Error('Unknown logic tag at line ' + lines + ': "' + tagname + '".');
            }

            if (tagname === 'autoescape') {
                last_escape = escape;
                escape = (!parts.length || parts[0] === 'on') ? ((parts.length >= 2) ? parts[i].replace(/^\"|\'|\'$|\"$/g, '') : true) : false;
            }

            token = {
                type: LOGIC_TOKEN,
                line: curline,
                name: tagname,
                args: parts.length ? parts : [],
                compile: tags[tagname],
                parent: _.uniq(stack[stack.length - 2])
            };

            if (tags[tagname].ends) {
                stack[index].push(token);
                stack.push(token.tokens = []);
                index += 1;
                continue;
            }
        }

        // Everything else is treated as a string
        stack[index].push(token);
    }

    if (index !== 0) {
        lastToken = _.last(stack[stack.length - 2]);
        throw new Error('Missing end tag for "' + lastToken.name + '" that was opened on line ' + lastToken.line + '.');
    }

    return stack[index];
};

exports.compile = function compile(indent, parentBlock) {
    var code = '',
        tokens = [],
        parent,
        filepath,
        blockname,
        varOutput;

    indent = indent || '';

    // Precompile - extract blocks and create hierarchy based on 'extends' tags
    // TODO: make block and extends tags accept context variables
    if (this.type === TEMPLATE) {
        _.each(this.tokens, function (token, index) {
            // Load the parent template
            if (token.name === 'extends') {
                filepath = token.args[0];
                if (!helpers.isStringLiteral(filepath) || token.args.length > 1) {
                    throw new Error('Extends tag on line ' + token.line + ' accepts exactly one string literal as an argument.');
                }
                if (index > 0) {
                    throw new Error('Extends tag must be the first tag in the template, but "extends" found on line ' + token.line + '.');
                }
                token.template = this.fromFile(filepath.replace(/['"]/g, ''));
                this.parent = token.template;
            } else if (token.name === 'block') { // Make a list of blocks
                blockname = token.args[0];
                if (!helpers.isValidBlockName(blockname) || token.args.length !== 1) {
                    throw new Error('Invalid block tag name "' + blockname + '" on line ' + token.line + '.');
                }
                if (this.type !== TEMPLATE) {
                    throw new Error('Block "' + blockname + '" found nested in another block tag on line' + token.line + '.');
                }
                try {
                    if (this.hasOwnProperty('parent') && this.parent.blocks.hasOwnProperty(blockname)) {
                        this.blocks[blockname] = compile.call(token, indent + '  ', this.parent.blocks[blockname]);
                    } else if (this.hasOwnProperty('blocks')) {
                        this.blocks[blockname] = compile.call(token, indent + '  ');
                    }
                } catch (error) {
                    throw new Error('Circular extends found on line ' + token.line + ' of "' + this.id + '"!');
                }
            }
            tokens.push(token);
        }, this);

        if (tokens.length && tokens[0].name === 'extends') {
            this.blocks = _.extend({}, this.parent.blocks, this.blocks);
            this.tokens = this.parent.tokens;
        }
    }

    // If this is not a template then just iterate through its tokens
    _.each(this.tokens, function (token, index) {
        if (typeof token === 'string') {
            code += '__output += "' + token.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/"/g, '\\"') + '";';
            return code;
        }

        if (typeof token !== 'object') {
            return; // Tokens can be either strings or objects
        }

        if (token.type === VAR_TOKEN) {
            var name = token.name.replace(/\W/g, '_'),
                args = '[]';
            code += 'if (typeof __context !== "undefined" && typeof __context.' + name + ' === "function") {\n';
            if (token.args && token.args.length) {
                _.each(token.args, function (value, key) {
                    var parsedVar,
                        parsedVarName;

                    if (helpers.isValidName(value)) {
                        parsedVarName = exports.parseVariable(value);
                        parsedVar = parsedVarName.name.replace(/\W/g, '_');
                        code += helpers.setVar('__' + parsedVar, parsedVarName);
                        token.args[key] = '__' + parsedVar;
                    }
                });
                args = '[' + token.args.join(',') + ']';
            }
            code += '    __output += __context.' + name + '.apply(null, ' + args + ');\n';
            code += '} else {\n';
            code += helpers.setVar('__' + name, token);
            code += '    __output += __' + name + ';\n';
            code += '}';
        }

        if (token.type !== LOGIC_TOKEN) {
            return; // Tokens can be either VAR_TOKEN or LOGIC_TOKEN
        }

        if (token.name === 'block') {
            if (this.type !== TEMPLATE) {
                throw new Error('Block "' + token.args[0] + '" found nested in another block tag on line ' + token.line + '.');
            }

            if (this.hasOwnProperty('blocks')) {
                code += this.blocks[token.args[0]]; // Blocks are already compiled in the precompile part
            }
        } else if (token.name === 'parent') {
            code += indent + '  ' + parentBlock;
        } else {
            code += token.compile(indent + '  ');
        }

    }, this);

    return code;
};