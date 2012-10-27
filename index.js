var dir = (process.env.SWIG_COVERAGE) ? './lib-cov/' : './lib/';

module.exports = require(dir + 'swig');
