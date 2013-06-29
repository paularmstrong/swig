var fs = require('fs'),
  _ = require('lodash'),
  parser = require('./parser');

var defaultOptions = {
    vars: ['{{', '}}'],
    tags: ['{%', '%}'],
    cmts: ['{#', '#}']
  },
  defaultInstance;

exports.setDefaults = function (options) {
  _.extend(defaultOptions, options);
};

exports.Swig = function (opts) {
  this.options = _.defaults(opts || {}, defaultOptions);
  var self = this;

  this.parse = function (source, options) {
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
