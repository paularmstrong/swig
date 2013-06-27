var helpers = require('../helpers'),
  _ = require('underscore');

/**
 * include
 */
module.exports = function (indent, parser) {
  var args = _.clone(this.args),
    template = args.shift(),
    context = '_context',
    ignore = false,
    out = '',
    ctx;

  indent = indent || '';

  if (!helpers.isLiteral(template) && !helpers.isValidName(template)) {
    throw new Error('Invalid arguments passed to \'include\' tag.');
  }

  if (args.length) {
    if (_.last(args) === 'only') {
      context = '{}';
      args.pop();
    }

    if (args.length > 1 && args[0] === 'ignore' & args[1] === 'missing') {
      args.shift();
      args.shift();
      ignore = true;
    }

    if (args.length && args[0] !== 'with') {
      throw new Error('Invalid arguments passed to \'include\' tag.');
    }

    if (args[0] === 'with') {
      args.shift();
      if (!args.length) {
        throw new Error('Context for \'include\' tag not provided, but expected after \'with\' token.');
      }

      ctx = args.shift();

      context = '_context["' + ctx + '"] || ' + ctx;
    }
  }

  out = '(function () {\n' +
    helpers.setVar('__template', parser.parseVariable(template)) + '\n' +
    '  var includeContext = ' + context + ';\n';

  if (ignore) {
    out += 'try {\n';
  }

  out += '  if (typeof __template === "string") {\n';
  out += '    _output += _this.compileFile(__template).render(includeContext, _parents);\n';
  out += '  }\n';

  if (ignore) {
    out += '} catch (e) {}\n';
  }
  out += '})();\n';

  return out;
};
