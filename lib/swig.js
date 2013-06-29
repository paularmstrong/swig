var fs = require('fs'),
  _ = require('lodash'),
  parser = require('./parser');

var defaultOptions = {
    vars: ['{{', '}}'],
    tags: ['{%', '%}'],
    cmts: ['{#', '#}']
  },
  defaultInstance;

function validateOptions(options) {
  if (!options) {
    return;
  }

  _.each(['vars', 'tags', 'cmts'], function (key) {
    if (!options.hasOwnProperty(key)) {
      return;
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
};

exports.Swig = function (opts) {
  this.options = _.defaults(opts || {}, defaultOptions);
  var self = this;

  this.parse = function (source, options) {
    validateOptions(options);
    options = _.extend({}, self.options, options);
    parser.parse(source, options);
  };

  this.compile = function (source, options) {
    var tpl = exports.parse(source, options);
    return function (context) {
      return tpl(context);
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
