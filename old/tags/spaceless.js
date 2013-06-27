/**
 * spaceless
 */
module.exports = function (indent, parser) {
	var output = [],
		i = this.tokens.length - 1;

	for (i; i >= 0; i -= 1) {
		this.tokens[i] = this.tokens[i]
			.replace(/^\s+/gi, "") // trim leading white-space
			.replace(/>\s+</gi,  "><") // trim white-space between tags
			.replace(/\s+$/gi, ""); // trim trailing white-space
	}

	output.push(parser.compile.call(this, indent + '    '));
	return output.join('');
};

module.exports.ends = true;
