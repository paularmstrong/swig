var _ = require('lodash');

var TYPES = exports.types = {
    WHITESPACE: 0,
    STRING: 1,
    FILTER: 2,
    FILTERSTART: 3,
    FILTEREND: 4,
    COMMA: 5,
    VAR: 6,
    NUMBER: 7,
    OPERATOR: 8
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
        /^".*?[^\\]"/,
        /^'.*?[^\\]'/
      ]
    },
    {
      type: TYPES.FILTER,
      regex: [
        /^\|(\w+)\(\)/
      ],
      idx: 1
    },
    {
      type: TYPES.FILTERSTART,
      regex: [
        /^\|(\w+)\(/
      ],
      idx: 1
    },
    {
      type: TYPES.FILTEREND,
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
