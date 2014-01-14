var tags = [
  {
    name: 'mytag',
    parse: function (str, line, parser, types) {
      return true;
    },
    compile: function (compiler, args, content, parents, options, blockName) {
      return compiler(content) + '\n' + '_output += " world!"';
    },
    ends: true
  }
];

module.exports = function (swig) {
  var ind, len;

  for (ind = 0, len = tags.length; ind < len; ind += 1) {
    swig.setTag(tags[ind].name, tags[ind].parse, tags[ind].compile, !!tags[ind].ends, !!tags[ind].blockLevel);
  }
};