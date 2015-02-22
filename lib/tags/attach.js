var ignore = 'ignore',
    missing = 'missing';
/*
var path = require('path'),
    resolve = path.resolve,
    dirname = path.dirname;

exports.compile = function (compiler, args, content, parents, options, blockName) {
  var file = args.shift().replace(/'/g, ''),
      parentFile = (args.pop() || '').replace(/\\/g, '\\\\'),
      ignore = args[args.length - 1] === missing ? (args.pop()) : false;




  file = resolve(dirname(parentFile), file);
  return (ignore ? ' try {\n' : '') +
    '_output += _swig.options.loader.load(\'' + file + '\');\n' +
    (ignore ? '} catch (e) {}\n' : '');
};*/

exports.compile = function (compiler, args, content, parents, options, blockName) {
  var file = args.shift(),
    parentFile = (args.pop() || '').replace(/\\/g, '\\\\'),
    ignore = args[args.length - 1] === missing ? (args.pop()) : false;

  return (ignore ? ' try {\n' : '') +
    '_output += _swig.options.loader.load(_swig.options.loader.resolve(' + file + ', "' + parentFile + '"));\n' +
    (ignore ? '} catch (e) {}\n' : '');
};


exports.parse = function (str, line, parser, types, stack, opts) {
  var file;
  parser.on(types.STRING, function (token) {
    if (!file) {
      file = token.match;
      this.out.push(file);
      return;
    }

    return true;
  });

  parser.on(types.VAR, function (token) {
    if (!file) {
      file = token.match;
      return true;
    }

    if (token.match === ignore) {
      return false;
    }

    if (token.match === missing) {
      if (this.prevToken.match !== ignore) {
        throw new Error('Unexpected token "' + missing + '" on line ' + line + '.');
      }
      this.out.push(token.match);
      return false;
    }

    if (this.prevToken.match === ignore) {
      throw new Error('Expected "' + missing + '" on line ' + line + ' but found "' + token.match + '".');
    }

    return true;
  });

  parser.on('end', function () {
    this.out.push(opts.filename || null);
  });

  return true;
};