var _ = require('lodash'),
  utils = require('./utils');

var parseVariable;

function escapeRegExp(str) {
  return str.replace(/[\-\/\\\^$*+?.()|\[\]{}]/g, '\\$&');
}

exports.parse = function (source, opts) {
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

    return {
      compile: function () {
        return '_output += ' + str + ';\n';
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
      token = parseTag(chunk.replace(tagStrip, ''), opts.tags, stack);
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

exports.compile = function (template, parent) {
  var out = '',
    tokens = template.tokens;

  if (parent) {
    tokens = _.map(parent.tokens, function (token) {
      if (token.name === 'block' && template.blocks[token.args]) {
        token = template.blocks[token.args];
      }
      return token;
    });
  }


  _.each(tokens, function (token, index) {
    if (typeof token === 'string') {
      out += '_output += "' + token.replace(/\n|\r/g, '\\n') + '";\n';
      return;
    }

    out += token.compile(exports.compile, token.setup, token.args, token.content, token.teardown);
  });

  return out;
};
