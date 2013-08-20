/**
 * Set a variable for re-use in the current context.
 *
 * @alias set
 *
 * @example
 * {% set foo = "anything!" %}
 * {{ foo }}
 * // => anything!
 *
 * @example
 * // index = 2;
 * {% set bar = 1 %}
 * {% set bar += index|default(3) %}
 * // => 3
 *
 * @param {literal} varname   The variable name to assign the value to.
 * @param {literal} assignement   Any valid JavaScript assignement. <code data-language="js">=, +=, *=, /=, -=</code>
 * @param {*}   value     Valid variable output.
 */
exports.compile = function (compiler, args, content) {
  return args.join(' ') + ';\n';
};

exports.parse = function (str, line, parser, types, stack) {
  var nameSet;
  parser.on(types.VAR, function (token) {
    if (!this.out.length) {
      nameSet = token.match;
      this.out.push(
        // Prevent the set from spilling into global scope
        'var ' + nameSet + ' = _ctx.' + nameSet + ';\n' + nameSet
      );
      return;
    }

    return true;
  });

  parser.on(types.ASSIGNMENT, function (token) {
    if (this.out.length !== 1 || !nameSet) {
      throw new Error('Unexpected assignment "' + token.match + '" on line ' + line + '.');
    }

    this.out.push(token.match);
  });

  return true;
};

exports.block = true;
