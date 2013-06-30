var _ = require('lodash'),
  utils = require('./utils');

var parseVariable;

function escapeRegExp(str) {
  return str.replace(/[\-\/\\\^$*+?.()|\[\]{}]/g, '\\$&');
}

parseVariable = exports.parseVariable = function (str) {
  if (!str) {
    return '';
  }

  return {
    compile: function () {
      return [
        'if (_ctx["' + str + '"]) {\n',
        '  _output += _ctx["' + str + '"];\n',
        '} else {\n',
        '  _output += ' + str + ';\n',
        '}\n'
      ].join('');
    }
  };
};

exports.parse = function (source, opts) {
  source = source.replace(/\r\n/g, '\n');
  // Split the template source based on variable, tag, and comment blocks
  // /(\{\{.*?\}\}|\{\%.*?\%\}|\{\#[^.*?\#\})/
  var tagOpen = opts.tags[0],
    tagClose = opts.tags[1],
    tagStrip = new RegExp('^' + escapeRegExp(tagOpen) + '\\s*|\\s*' + escapeRegExp(tagClose) + '$', 'g'),
    varOpen = opts.vars[0],
    varClose = opts.vars[1],
    varStrip = new RegExp('^' + escapeRegExp(varOpen) + '\\s*|\\s*' + escapeRegExp(varClose) + '$', 'g'),
    cmtOpen = opts.cmts[0],
    cmtClose = opts.cmts[1],
    splitter = new RegExp(
      '(' +
        escapeRegExp(tagOpen) + '.*?' + escapeRegExp(tagClose) + '|' +
        escapeRegExp(varOpen) + '.*?' + escapeRegExp(varClose) + '|' +
        escapeRegExp(cmtOpen) + '.*?' + escapeRegExp(cmtClose) +
        ')'
    ),
    tokens = [],
    line = 1 + source.match(/^\n*/)[0].length;

  source = _.without(utils.strip(source).split(splitter), '');

  _.each(source, function (chunk) {
    if (utils.startsWith(chunk, varOpen) && utils.endsWith(chunk, varClose)) {
      chunk = parseVariable(chunk.replace(varStrip, ''));
    } else if (utils.startsWith(chunk, tagOpen) && utils.endsWith(chunk, tagClose)) {
      chunk = parseVariable(chunk.replace(tagStrip, ''));
    } else if (utils.startsWith(chunk, cmtOpen) && utils.endsWith(chunk, cmtClose)) {
      return;
    }

    tokens.push(chunk);
  });

  return tokens;
};

exports.compile = function (tokens) {
  var out = '';
  _.each(tokens, function (token, index) {
    if (typeof token === 'string') {
      out += '_output += "' + token + '";\n';
      return;
    }
    out += token.compile();
  });
  return out;
};
