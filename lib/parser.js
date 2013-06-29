var _ = require('lodash'),
  utils = require('./utils');

function escapeRegExp(str) {
  return str.replace(/[\-\/\\\^$*+?.()|\[\]{}]/g, '\\$&');
}

exports.parse = function (source, opts) {
  // Split the template source based on variable, tag, and comment blocks
  // /(\{\{.*?\}\}|\{\%.*?\%\}|\{\#[^.*?\#\})/
  var tagOpen = opts.tags[0],
    tagClose = opts.tags[1],
    varOpen = opts.vars[0],
    varClose = opts.vars[1],
    cmtOpen = opts.cmts[0],
    cmtClose = opts.cmts[1],
    splitter = new RegExp(
      '(' +
        escapeRegExp(tagOpen) + '.*?' + escapeRegExp(tagClose) + '|' +
        escapeRegExp(varOpen) + '.*?' + escapeRegExp(varClose) + '|' +
        escapeRegExp(cmtOpen) + '.*?' + escapeRegExp(cmtClose) +
        ')'
    );
  source = _.without(utils.strip(source).split(splitter), '');

  console.log(source);

  _.each(source, function (chunk) {
    if (utils.startsWith(chunk, varOpen) && utils.endsWith(chunk, varClose)) {
      console.log(chunk, 'is a variable');
    }

    if (utils.startsWith(chunk, tagOpen) && utils.endsWith(chunk, tagClose)) {
      console.log(chunk, 'is a tag');
    }

    if (utils.startsWith(chunk, cmtOpen) && utils.endsWith(chunk, cmtClose)) {
      console.log(chunk, 'is a comment');
    }
  });
};
