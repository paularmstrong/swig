/**
 * Support async execution of the enclosed block.  Use for helper functions that must execute async.  Helper func calls done when complete with output <code>done('some output')</code>
 *
 * @alias async
 *
 * @example
 * {% async %}
 * {{ myfunc(done) }}
 * {% endasync %}
 *
 */
exports.compile = function (compiler, args, content) {
    return [
        '(function () {\n',
        '  _asyncCb(_output.length, function(done) { \n',
        '  var _output = "";\n' +
        '  ' + compiler(content) + '\n',
        '  });\n',
        '})();\n'
    ].join('');

};

exports.parse = function (str, line, parser, types, stack) {
    return true;
};
exports.ends = true;
