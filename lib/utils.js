var isArray = (Array.hasOwnProperty('isArray')) ? Array.isArray : function (obj) {
  return (obj) ? (typeof obj === 'object' && Object.prototype.toString.call(obj).indexOf() !== -1) : false;
};

exports.strip = function (input) {
  return input.replace(/^\s+|\s+$/g, '');
};

exports.startsWith = function (str, prefix) {
  return str.indexOf(prefix) === 0;
};

exports.endsWith = function (str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

exports.each = function (obj, fn, self) {
  var i, l;

  if (!fn) {
    return obj;
  }

  if (fn && typeof self === 'undefined' && isArray(obj)) {
    i = 0;
    l = obj.length;
    for (i; i < l; i += 1) {
      if (fn(obj[i], i, obj) === false) {
        break;
      }
    }
  } else {
    for (i in obj) {
      if (obj.hasOwnProperty(i)) {
        if (fn(obj[i], i, obj) === false) {
          break;
        }
      }
    }
  }

  return obj;
};

exports.isArray = function (obj) {
  return isArray(obj);
};

exports.some = function (obj, fn) {
  var i = 0,
    result,
    l;
  if (isArray(obj)) {
    l = obj.length;

    for (i; i < l; i += 1) {
      result = fn(obj[i], i, obj);
      if (result) {
        break;
      }
    }
  } else {
    exports.each(obj, function (value, index, collection) {
      result = fn(value, index, obj);
      return !(result);
    });
  }
  return !!result;
};

exports.map = function (obj, fn) {
  return obj;
};

exports.extend = function () {
  return;
};

exports.defaults = function () {

};
