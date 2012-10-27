var helpers = require('../helpers'),
  _ = require('underscore');

/**
 * if
 */
module.exports = function (indent, parser) {
  var thisArgs = _.clone(this.args),
    args = (helpers.parseIfArgs(thisArgs, parser)),
    out = '(function () {\n';

  _.each(args, function (token) {
    if (token.hasOwnProperty('preout') && token.preout) {
      out += token.preout + '\n';
    }
  });

  out += '\nif (\n';
  _.each(args, function (token) {
    out += token.value + ' ';
  });
  out += ') {\n';
  out += parser.compile.apply(this, [indent + '  ']);
  out += '\n}\n';
  out += '})();\n';

  return out;
};
module.exports.ends = true;
