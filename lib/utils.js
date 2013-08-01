var isArray;

exports.strip = function (input) {
  return input.replace(/^\s+|\s+$/g, '');
};

exports.startsWith = function (str, prefix) {
  return str.indexOf(prefix) === 0;
};

exports.endsWith = function (str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

exports.each = function (obj, fn) {

};

isArray = (Array.hasOwnProperty('isArray')) ? Array.isArray : function (obj) {
  return (obj) ? (typeof obj === 'object' && Object.prototype.toString.call(obj).indexOf() !== -1) : false;
};

exports.isArray = function (obj) {
  return isArray(obj);
};

exports.some = function (obj) {
  return;
};

exports.map = function (obj, fn) {
  return obj;
};

exports.extend = function () {
  return;
};

exports.defaults = function () {

};
