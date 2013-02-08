var _ = require('underscore');

_.extend(exports, {
  autoescape: require('./tags/autoescape'),
  block: require('./tags/block'),
  'else': require('./tags/else'),
  'extends': require('./tags/extends'),
  filter: require('./tags/filter'),
  'for': require('./tags/for'),
  'if': require('./tags/if'),
  'import': require('./tags/import'),
  include: require('./tags/include'),
  macro: require('./tags/macro'),
  parent: require('./tags/parent'),
  raw: require('./tags/raw'),
  set: require('./tags/set'),
  spaceless: require('./tags/spaceless')
});
