(function () {
    var str = '{{ a }}',
        splitter;
    if (str.split(/(\{\{.*?\}\})/).length === 0) {

        /** Repurposed from Steven Levithan's
         *  Cross-Browser Split 1.0.1 (c) Steven Levithan <stevenlevithan.com>; MIT License An ECMA-compliant, uniform cross-browser split method
         */
        splitter = function (str, separator, limit) {
            if (Object.prototype.toString.call(separator) !== '[object RegExp]') {
                return splitter._nativeSplit.call(str, separator, limit);
            }

            var output = [],
                lastLastIndex = 0,
                flags = (separator.ignoreCase ? 'i' : '') + (separator.multiline ? 'm' : '') + (separator.sticky ? 'y' : ''),
                separator2,
                match,
                lastIndex,
                lastLength;

            separator = RegExp(separator.source, flags + 'g');

            str = str.toString();
            if (!splitter._compliantExecNpcg) {
                separator2 = RegExp('^' + separator.source + '$(?!\\s)', flags);
            }

            if (limit === undefined || limit < 0) {
                limit = Infinity;
            } else {
                limit = Math.floor(+limit);
                if (!limit) {
                    return [];
                }
            }

            function fixExec() {
                var i = 1;
                for (i; i < arguments.length - 2; i += 1) {
                    if (arguments[i] === undefined) {
                        match[i] = undefined;
                    }
                }
            }

            match = separator.exec(str);
            while (match) {
                lastIndex = match.index + match[0].length;

                if (lastIndex > lastLastIndex) {
                    output.push(str.slice(lastLastIndex, match.index));

                    if (!splitter._compliantExecNpcg && match.length > 1) {
                        match[0].replace(separator2, fixExec);
                    }

                    if (match.length > 1 && match.index < str.length) {
                        Array.prototype.push.apply(output, match.slice(1));
                    }

                    lastLength = match[0].length;
                    lastLastIndex = lastIndex;

                    if (output.length >= limit) {
                        break;
                    }
                }

                if (separator.lastIndex === match.index) {
                    separator.lastIndex += 1; // avoid an infinite loop
                }
                match = separator.exec(str);
            }

            if (lastLastIndex === str.length) {
                if (lastLength || !separator.test('')) {
                    output.push('');
                }
            } else {
                output.push(str.slice(lastLastIndex));
            }

            return output.length > limit ? output.slice(0, limit) : output;
        };

        splitter._compliantExecNpcg = /()??/.exec('')[1] === undefined;
        splitter._nativeSplit = String.prototype.split;

        String.prototype.split = function (separator, limit) {
            return splitter(this, separator, limit);
        };
    }
}());
