var _ = require('lodash');

var TYPES = exports.types = {
    WHITESPACE: 0,
    STRING: 1,
    FILTER: 3,
    FUNCTION: 4,
    PARENOPEN: 6,
    COMMA: 7,
    VAR: 8,
    NUMBER: 9,
    OPERATOR: 10,
    BRACKETKEY: 11,
    DOTKEY: 12
  },
  rules = [
    {
      type: TYPES.WHITESPACE,
      regex: [
        /^\s+/
      ]
    },
    {
      type: TYPES.STRING,
      regex: [
        /^""/,
        /^".*?[^\\]"/,
        /^''/,
        /^'.*?[^\\]'/
      ]
    },
    {
      type: TYPES.FILTER,
      regex: [
        /^\|\s*(\w+)\(/
      ],
      idx: 1
    },
    {
      type: TYPES.FUNCTION,
      regex: [
        /^\s*(\w+)\(/
      ],
      idx: 1
    },
    {
      type: TYPES.PARENOPEN,
      regex: [
        /^\(/
      ]
    },
    {
      type: TYPES.PARENCLOSE,
      regex: [
        /^\)/
      ]
    },
    {
      type: TYPES.COMMA,
      regex: [
        /^,/
      ]
    },
    {
      type: TYPES.VAR,
      regex: [
        /^[a-zA-Z]\w*/
      ]
    },
    {
      // TODO: switch to bracket-open, bracket-close
      // so that variables can be parsed inside brackets
      type: TYPES.BRACKETKEY,
      regex: [
        /^\[(".*?[^\\]")\]/,
        /^\[('.*?[^\\]')\]/,
        /^\[(\d+)\]/
      ],
      idx: 1
    },
    {
      type: TYPES.DOTKEY,
      regex: [
        /^\.(\w+)/,
      ],
      idx: 1
    },
    {
      type: TYPES.NUMBER,
      regex: [
        /^[+\-]?\d+(\.\d+)?/
      ]
    },
    {
      type: TYPES.OPERATOR,
      regex: [
        /^(\+|\-|\/|\*|%)/
      ]
    }
  ];

function reader(str) {
  var matched;

  _.some(rules, function (rule) {
    return _.some(rule.regex, function (regex) {
      var match = str.match(regex);
      if (match) {
        matched = {
          match: match[rule.idx || 0],
          type: rule.type,
          length: match[0].length
        };
        return true;
      }
    });
  });

  if (!matched) {
    return;
  }

  return matched;
}

exports.read = function (str) {
  var offset = 0,
    tokens = [],
    substr,
    match;
  while (offset < str.length) {
    substr = str.substring(offset);
    match = reader(substr);
    if (!match) {
      throw new Error('Unable to understand the rest of this: "' + substr + '".');
    }
    offset += match.length;
    tokens.push(match);
  }
  return tokens;
};
