var _ = require('underscore');

_.extend(exports, {
    autoescape: require('./tags/autoescape').autoescape,
    block: require('./tags/block').block,
    'else': require('./tags/else').else,
    extends: require('./tags/extends').extends,
    filter: require('./tags/filter').filter,
    'for': require('./tags/for').for,
    'if': require('./tags/if').if,
    'import': require('./tags/import').import,
    include: require('./tags/include').include,
    macro: require('./tags/macro').macro,
    parent: require('./tags/parent').parent,
    raw: require('./tags/raw').raw,
    set: require('./tags/set').set
});
