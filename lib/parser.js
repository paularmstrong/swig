var _ = require('lodash'),
  utils = require('./utils'),
  lexer = require('./lexer');

var parseVariable;

function escapeRegExp(str) {
  return str.replace(/[\-\/\\\^$*+?.()|\[\]{}]/g, '\\$&');
}

exports.parse = function (source, opts, tags, filters) {
  source = source.replace(/\r\n/g, '\n');
  // Split the template source based on variable, tag, and comment blocks
  // /(\{\{.*?\}\}|\{\%.*?\%\}|\{\#[^.*?\#\})/
  var tagOpen = opts.tagControls[0],
    tagClose = opts.tagControls[1],
    varOpen = opts.varControls[0],
    varClose = opts.varControls[1],
    escapedTagOpen = escapeRegExp(tagOpen),
    escapedTagClose = escapeRegExp(tagClose),
    escapedVarOpen = escapeRegExp(varOpen),
    escapedVarClosed = escapeRegExp(varClose),
    tagStrip = new RegExp('^' + escapedTagOpen + '\\s*|\\s*' + escapedTagClose + '$', 'g'),
    varStrip = new RegExp('^' + escapedVarOpen + '\\s*|\\s*' + escapedVarClosed + '$', 'g'),
    cmtOpen = opts.cmtControls[0],
    cmtClose = opts.cmtControls[1],
    splitter = new RegExp(
      '(' +
        escapedTagOpen + '.*?' + escapedTagClose + '|' +
        escapedVarOpen + '.*?' + escapedVarClosed + '|' +
        escapeRegExp(cmtOpen) + '.*?' + escapeRegExp(cmtClose) +
        ')'
    ),
    line = 1 + source.match(/^\n*/)[0].length,
    stack = [],
    parent = null,
    tokens = [],
    blocks = {};

  function parseVariable(str) {
    if (!str) {
      return;
    }

    var tokens = lexer.read(utils.strip(str)),
      out = [],
      fxStack = [],
      functionStack = [];

    _.each(tokens, function (token, i) {
      var match = token.match,
        prevToken = tokens[i - 1];

      if (fxStack.length && _.last(fxStack).type === lexer.types.FILTER && token.type !== lexer.types.PARENCLOSE && token.type !== lexer.types.COMMA && token.type !== lexer.types.OPERATOR) {
        out.push(', ');
      }

      switch (token.type) {
      case lexer.types.WHITESPACE:
        break;

      case lexer.types.STRING:
      case lexer.types.NUMBER:
        out.push(match);
        break;

      case lexer.types.FILTER:
        if (!filters.hasOwnProperty(match) || typeof filters[match] !== "function") {
          throw new Error('Invalid filter "' + match + '" found.');
        }
        fxStack.push(token);
        out.unshift('_filters["' + match + '"](');
        break;

      case lexer.types.FUNCTION:
        fxStack.push(token);
        out.push(match + '(');
        break;

      case lexer.types.PARENOPEN:
        out.push('(');
        break;

      case lexer.types.PARENCLOSE:
        fxStack.pop();
        out.push(')');
        break;

      case lexer.types.COMMA:
        if (fxStack.length === 0) {
          throw new Error('Unexpected comma.');
        }
        out.push(', ');
        break;

      case lexer.types.VAR:
        out.push('((typeof ' + match + ' !== "undefined") ? ' + match + ' : "")');
        break;

      case lexer.types.BRACKETKEY:
        if (prevToken.type !== lexer.types.VAR && prevToken.type !== lexer.types.BRACKETKEY && prevToken.type !== lexer.types.DOTKEY) {
          throw new Error('Unexpected key "' + match + '".');
        }
        out.splice(out.length - 1, 0, '((');
        out.push('.hasOwnProperty(' + match + ')) ? ' + prevToken.match + '[' + match + '] : "")');
        break;

      case lexer.types.DOTKEY:
        if (prevToken.type !== lexer.types.VAR && prevToken.type !== lexer.types.BRACKETKEY && prevToken.type !== lexer.types.DOTKEY) {
          throw new Error('Unexpected key "' + match + '".');
        }
        out.splice(out.length - 1, 0, '((');
        out.push('.hasOwnProperty("' + match + '")) ? ' + prevToken.match + '.' + match + ' : "")');
        break;

      case lexer.types.OPERATOR:
        out.push(' ' + match + ' ');
        break;
      }
    });

    return {
      compile: function () {
        return '_output += ' + out.join('') + ';\n';
      }
    };
  }
  exports.parseVariable = parseVariable;

  function parseTag(str, tags) {
    if (!str) {
      return;
    }

    var chunks, tagName, tag, args, last;

    if (utils.startsWith(str, 'end')) {
      last = _.last(stack);
      if (last.name === str.replace(/^end/, '') && last.ends) {
        stack.pop();
        return;
      }

      throw new Error('Unexpected tag ' + str + '.');
    }

    chunks = str.split(/\s+(.+)?/);
    tagName = chunks[0];
    tag = tags[tagName];
    args = tag.parse(chunks[1]);

    return {
      compile: tag.compile,
      setup: '',
      teardown: '',
      args: args,
      content: { tokens: [] },
      ends: tag.ends,
      name: tagName
    };
  }

  source = _.without(source.split(splitter), '');

  _.each(source, function (chunk) {
    var token;

    if (utils.startsWith(chunk, varOpen) && utils.endsWith(chunk, varClose)) {
      token = parseVariable(chunk.replace(varStrip, ''));
    } else if (utils.startsWith(chunk, tagOpen) && utils.endsWith(chunk, tagClose)) {
      token = parseTag(chunk.replace(tagStrip, ''), tags, stack);
      if (token && token.name === 'extends') {
        parent = token.args;
      }
      if (token && token.name === 'block') {
        blocks[token.args] = token;
      }
    } else if (!utils.startsWith(chunk, cmtOpen) && !utils.endsWith(chunk, cmtClose)) {
      token = chunk;
    }

    if (!token) {
      return;
    }

    if (stack.length) {
      stack[stack.length - 1].content.tokens.push(token);
    } else {
      tokens.push(token);
    }

    if (token.name && token.ends) {
      stack.push(token);
    }
  });

  return {
    parent: parent,
    tokens: tokens,
    blocks: blocks
  };
};

// Re-Map blocks within a list of tokens to the template's block objects
function remapBlocks(tokens, template) {
  return _.map(tokens, function (token) {
    if (token.name === 'block' && template.blocks[token.args]) {
      token = template.blocks[token.args];
    }
    if (token.content && token.content.tokens && token.content.tokens.length) {
      token.content.tokens = remapBlocks(token.content.tokens, template);
    }
    return token;
  });
}

exports.compile = function (template, parent) {
  var out = '',
    tokens = template.tokens;

  if (parent && template.blocks) {
    tokens = remapBlocks(parent.tokens, template);
  }

  _.each(tokens, function (token, index) {
    if (typeof token === 'string') {
      out += '_output += "' + token.replace(/\n|\r/g, '\\n').replace('"', '\\"') + '";\n';
      return;
    }

    out += token.compile(exports.compile, token.setup, token.args, token.content, parent, token.teardown);
  });

  return out;
};
