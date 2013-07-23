var _ = require('lodash'),
  utils = require('./utils'),
  lexer = require('./lexer');

var _t = lexer.types,
  parseVariable;

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
    line = 1,
    stack = [],
    parent = null,
    tokens = [],
    blocks = {};

  function parseVariable(str, line) {
    if (!str) {
      return;
    }

    var tokens = lexer.read(utils.strip(str)),
      out = [],
      state = [];

    _.each(tokens, function (token, i) {
      var match = token.match,
        prevToken = tokens[i - 1],
        lastState = (state.length) ? _.last(state) : null,
        temp;

      if (lastState && lastState === _t.FILTER && token.type !== _t.PARENCLOSE && token.type !== _t.COMMA && token.type !== _t.OPERATOR) {
        out.push(', ');
      }

      switch (token.type) {
      case _t.WHITESPACE:
        break;

      case _t.STRING:
      case _t.NUMBER:
        out.push(match);
        break;

      case _t.FILTER:
        if (!filters.hasOwnProperty(match) || typeof filters[match] !== "function") {
          throw new Error('Invalid filter "' + match + '" found on line ' + line + '.');
        }
        out.unshift('_filters["' + match + '"](');
        state.push(token.type);
        break;

      case _t.FUNCTION:
        state.push(token.type);
        out.push(match + '(');
        break;

      case _t.PARENOPEN:
        out.push('(');
        state.push(token.type);
        break;

      case _t.PARENCLOSE:
        temp = state.pop();
        if (temp !== _t.PARENOPEN && temp !== _t.FUNCTION && temp !== _t.FILTER) {
          throw new Error('Unexpected closing parenthesis on line ' + line + '.');
        }
        out.push(')');
        break;

      case _t.COMMA:
        if (lastState !== _t.FUNCTION && lastState !== _t.FILTER && lastState !== _t.ARRAYOPEN) {
          throw new Error('Unexpected comma on line ' + line + '.');
        }
        out.push(', ');
        break;

      case _t.VAR:
        match = match.split('.');
        out.push('(((typeof ' + match[0] + ' !== "undefined")');
        temp = match[0];
        _.chain(match).rest(1).each(function (v) {
          out.push(' && ' + temp + '.hasOwnProperty("' + v + '")');
          temp += '.' + v;
        });
        out.push(') ? ' + match.join('.') + ' : "")');
        break;

      case _t.BRACKETOPEN:
        if (!prevToken || (prevToken.type !== _t.VAR && prevToken.type !== _t.BRACKETCLOSE && prevToken.type !== _t.PARENCLOSE)) {
          state.push(_t.ARRAYOPEN);
        } else {
          state.push(token.type);
        }
        out.push('[');
        break;

      case _t.BRACKETCLOSE:
        temp = state.pop();
        if (temp !== _t.BRACKETOPEN && temp !== _t.ARRAYOPEN) {
          throw new Error('Unexpected closing square bracket on line ' + line + '.');
        }
        out.push(']');
        break;

      case _t.DOTKEY:
        if (prevToken.type !== _t.VAR && prevToken.type !== _t.BRACKETCLOSE && prevToken.type !== _t.DOTKEY) {
          throw new Error('Unexpected key "' + match + '" on line ' + line + '.');
        }
        out.push('.' + match);
        break;

      case _t.OPERATOR:
        out.push(' ' + match + ' ');
        break;
      }
    });

    if (state.length) {
      throw new Error('Unable to parse "' + str + '" on line ' + line + '.');
    }

    return {
      compile: function () {
        return '_output += ' + out.join('') + ';\n';
      }
    };
  }
  exports.parseVariable = parseVariable;

  function parseTag(str, line, tags) {
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

      throw new Error('Unexpected end of tag "' + str.replace(/^end/, '') + '" on line ' + line + '.');
    }

    chunks = str.split(/\s+(.+)?/);
    tagName = chunks[0];

    if (!tags.hasOwnProperty(tagName)) {
      throw new Error('Unexpected tag "' + str + '" on line ' + line + '.');
    }

    tag = tags[tagName];
    args = tag.parse(chunks[1], line);

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
    var token, lines;

    if (utils.startsWith(chunk, varOpen) && utils.endsWith(chunk, varClose)) {
      token = parseVariable(chunk.replace(varStrip, ''), line);
    } else if (utils.startsWith(chunk, tagOpen) && utils.endsWith(chunk, tagClose)) {
      token = parseTag(chunk.replace(tagStrip, ''), line, tags, stack);
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

    lines = chunk.match(/\n/g);
    line += (lines) ? lines.length : 0;
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
