var _ = require('lodash');

_.extend(exports, {
  'default': require('./filters/default'),
  escape: require('./filters/escape'),
  e: require('./filters/escape'),
  raw: require('./filters/raw')
});
