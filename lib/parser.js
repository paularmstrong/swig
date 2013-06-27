var _ = require('lodash'),
  utils = require('./utils');

exports.parse = function (source, opts) {
  var splitter = new RegExp(
      '(' +
      opts.tags[0] + '[^\r\n]*?' + opts.tags[1] + '|' +
      opts.vars[0] + '.*?' + opts.vars[1] + '|' +
      opts.cmts[0] + '[^\r\n]*?' + opts.cmts[1] +
      ')'
    );
  source = utils.strip(source).split(splitter);

  console.log(source)
};
