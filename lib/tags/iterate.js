var helpers = require('../helpers'),
  _ = require('underscore');

/**
* iterate
*/
module.exports = function (indent, parser) {
  var thisArgs = _.clone(this.args),
    operand1 = thisArgs[0],
    operator = thisArgs[1],
    operand2 = parser.parseVariable(thisArgs[2]),
    separator = thisArgs[3],
    operand3 = parser.parseVariable(thisArgs[4]),
    output;

  indent = indent || '';

  if (typeof operator !== 'undefined' && operator !== 'with') {
    throw new Error('Invalid syntax in "iterate" tag');
  }

  if (typeof separator !== 'undefined' && separator !== 'to') {
    throw new Error('Invalid syntax in "iterate" tag');
  }

  if (!helpers.isValidShortName(operand1)) {
    throw new Error('Invalid arguments (' + operand1 + ') passed to "iterate" tag');
  }

  if (!helpers.isValidName(operand2.name)) {
    throw new Error('Invalid arguments (' + operand2.name + ') passed to "iterate" tag');
  }

  if (!helpers.isValidName(operand3.name)) {
    throw new Error('Invalid arguments (' + operand3.name + ') passed to "iterate" tag');
  }

  operand1 = helpers.escapeVarName(operand1);

  output = '(function () {' +
    helpers.setVar('__iterFrom', operand2) +
    helpers.setVar('__iterTo', operand3) +
    '   for (var i = Number(__iterFrom); i <= Number(__iterTo); i++) {\n' +
    '       _context["' + operand1 + '"] = i;\n' +
    parser.compile.call(this, indent + '    ') +
    '   }\n' +
    '})();';

  return output;
};
module.exports.ends = true;