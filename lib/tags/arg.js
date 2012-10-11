var arg = function (indent, parentBlock, parser) {
    var value = '(function () {\n';
    value += '    var _output = "";\n';
    value += parser.compile.apply(this, [indent + '    ', parentBlock]) + '\n';
    value += '    return _output;\n';
    value += '})();\n';

    return value;
};
arg.ends = true;

module.exports = arg;