var fs = require('fs'),
  _ = require('lodash'),
  parser = require('./parser');

var defaultOptions = {
  vars: ['{{', '}}'],
  tags: ['{%', '%}'],
  cmts: ['{#', '#}']
};

exports.setDefaults = function (options) {
  _.extend(defaultOptions, options);
};

exports.parse = function (source, options) {
  console.log(defaultOptions)
  options = _.extend({}, defaultOptions, options);
  console.log(options)
  parser.parse(source, options);
};

exports.compile = function (source, options) {
  var tpl = exports.parse(source, options);
  return function (context) {
    return tpl(context);
  };
};

exports.render = function (source, options, context) {
  return exports.compile(source, options)(context);
};
