var fs = require('fs'),
  _ = require('lodash'),
  parser = require('./parser');

var defaultOptions = {
    varControls: ['{{', '}}'],
    tagControls: ['{%', '%}'],
    cmtControls: ['{#', '#}']
  },
  defaultInstance;

function validateOptions(options) {
  if (!options) {
    return;
  }

  _.each(['varControls', 'tagControls', 'cmtControls'], function (key) {
    if (!options.hasOwnProperty(key)) {
      return;
    }
    if (!_.isArray(options[key]) || options[key].length !== 2) {
      throw new Error('Option "' + key + '" must be an array containing 2 different control strings.');
    }
    if (options[key][0] === options[key][1]) {
      throw new Error('Option "' + key + '" open and close controls must not be the same.');
    }
    _.each(options[key], function (a, i) {
      if (a.length < 2) {
        throw new Error('Option "' + key + '" ' + ((i) ? 'open ' : 'close ') + 'control must be at least 2 characters. Saw "' + a + '" instead.');
      }
    });
  });
}

exports.setDefaults = function (options) {
  validateOptions(options);
  _.extend(defaultOptions, options);
  defaultInstance.options = _.extend(defaultInstance, options);
};

exports.Swig = function (opts) {
  this.options = _.defaults(opts || {}, defaultOptions);
  var self = this;

  this.parse = function (source, options) {
    validateOptions(options);
    options = _.extend({}, self.options, options);
    return parser.parse(source, options);
  };

  this.compile = function (source, options) {
    var tokens = exports.parse(source, options),
      code = parser.compile(tokens);

    return function (context) {

      var compiled = new Function('_ctx', [
        'var _output = "";',
        code,
        'return _output;'
      ].join('\n  '));

      return compiled(context);
    };
  };

  this.render = function (source, options, context) {
    return exports.compile(source, options)(context);
  };
};

defaultInstance = new exports.Swig();
exports.parse = defaultInstance.parse;
exports.compile = defaultInstance.compile;
exports.render = defaultInstance.render;
