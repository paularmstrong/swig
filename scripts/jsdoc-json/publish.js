/**
 * Custom jsdoc template for JSON.
 * Working on porting back at https://github.com/paularmstrong/jsdoc/tree/feature/json-template
 */
/*global dump:true */
function getType(obj) {
  return (obj.type) ? ((obj.type.names.length === 1) ? obj.type.names[0] : obj.type.names) : '';
}

var nodeNames = {
  'function': 'functions',
  'namespace': 'namespaces',
  'mixin': 'mixins',
  'event': 'events',
  'member': 'properties',
  'class': 'classes',
  'typedef': 'typedefs'
};

function pushParams(obj, key, element) {
  if (!element || !element.length) {
    return;
  }
  if (!obj[key]) {
    obj[key] = [];
  }
  element.forEach(function (param) {
    obj[key].push({
      'name': param.name,
      'type': getType(param),
      'description': param.description || '',
      'default': param.defaultvalue || '',
      'variable': !!param.variable,
      'optional': (typeof param.optional === 'boolean') ? param.optional : '',
      'nullable': (typeof param.nullable === 'boolean') ? param.nullable : ''
    });
  });
}

function graft(parentNode, childNodes, parentLongname, parentName) {
  childNodes
    .filter(function (element) {
      return (element.memberof === parentLongname);
    })
    .forEach(function (element) {
      var shouldGraft = false,
        nodeName = nodeNames[element.kind],
        thisObj = {
          'name': element.name,
          'description': element.description || '',
          'access': element.access || '',
          'virtual': !!element.virtual
        };

      if (!nodeName) {
        return;
      }

      if (!parentNode[nodeName]) {
        parentNode[nodeName] = [];
      }

      switch (element.kind) {
      case 'namespace':
        shouldGraft = true;
        break;

      case 'mixin':
        shouldGraft = true;
        break;

      case 'event':
      case 'function':
        thisObj.parameters = [];

        if (element.returns) {
          thisObj.returns = {
            'type': getType(element.returns[0]),
            'description': element.returns[0].description || ''
          };
        }

        if (element.throws) {
          thisObj.throws = {
            'type': getType(element.throws[0]),
            'description': element.throws[0].description || ''
          };
        }

        pushParams(thisObj, 'parameters', element.params);
        break;

      case 'member':
        thisObj.type = (element.type) ? ((element.type.length === 1) ? element.type[0] : element.type) : '';
        thisObj.properties = [];
        thisObj.isEnum = !!element.isEnum;
        pushParams(thisObj, 'properties', element.properties);
        break;

      case 'class':
        thisObj.fires = element.fires || '';
        thisObj.constructor = {
          'name': element.name,
          'description': element.description || '',
          'parameters': []
        };

        pushParams(thisObj.constructor, 'parameters', element.params);

        shouldGraft = true;
        break;

      case 'typedef':
        thisObj.type = getType(element);
        delete thisObj.access;
        delete thisObj.virtual;
        pushParams(thisObj, 'properties', element.properties);
        pushParams(thisObj, 'params', element.params);
        break;

      }

      thisObj.examples = element.examples || [];
      parentNode[nodeName].push(thisObj);
      if (shouldGraft) {
        graft(thisObj, childNodes, element.longname, element.name);
      }
    });
}

/**
  @param {TAFFY} data
  @param {object} opts
 */
exports.publish = function (data, opts) {
  var root = {},
    docs;

  data({ undocumented: true }).remove();
  docs = data().get(); // <-- an array of Doclet objects

  graft(root, docs);
  dump(root);
};
