var helpers = require('../helpers'),
  _ = require('underscore');

/**
 * import
 */
module.exports = function (indent, parser) {
  if (this.args.length !== 3) {
    throw new Error('Import statements require three arguments: {% import [template] as [context] %}.');
  }

  var thisArgs = _.clone(this.args),
    file = thisArgs[0],
    as = thisArgs[1],
    name = thisArgs[2],
    out = '';

  if (!helpers.isLiteral(file) && !helpers.isValidName(file)) {
    throw new Error('Invalid attempt to import "' + file  + '".');
  }

  if (as !== 'as') {
    throw new Error('Invalid syntax {% import "' + file + '" ' + as + ' ' + name + ' %}');
  }

  out += '_.extend(_context, (function () {\n';

  out += 'var _context = {}, __ctx = {}, _output = "";\n' +
    helpers.setVar('__template', parser.parseVariable(file)) +
    '_this.compileFile(__template).render(__ctx, _parents);\n' +
    '_.each(__ctx, function (item, key) {\n' +
    '  if (typeof item === "function") {\n' +
    '    _context["' + name + '_" + key] = item;\n' +
    '  }\n' +
    '});\n' +
    'return _context;\n';

  out += '})());\n';

  return out;
};
