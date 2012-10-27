var helpers = require('../helpers'),
  _ = require('underscore');

/**
 * else
 */
module.exports = function (indent, parser) {
  var last = _.last(this.parent).name,
    thisArgs = _.clone(this.args),
    ifarg,
    args,
    out;

  if (last === 'for') {
    if (thisArgs.length) {
      throw new Error('"else" tag cannot accept arguments in the "for" context.');
    }
    return '} if (__loopLength === 0) {\n';
  }

  if (last !== 'if') {
    throw new Error('Cannot call else tag outside of "if" or "for" context.');
  }

  ifarg = thisArgs.shift();
  args = (helpers.parseIfArgs(thisArgs, parser));
  out = '';

  if (ifarg) {
    out += '} else if (\n';
    out += '  (function () {\n';

    _.each(args, function (token) {
      if (token.hasOwnProperty('preout') && token.preout) {
        out += token.preout + '\n';
      }
    });

    out += 'return (\n';
    _.each(args, function (token) {
      out += token.value + ' ';
    });
    out += ');\n';

    out += '  })()\n';
    out += ') {\n';

    return out;
  }

  return indent + '\n} else {\n';
};
