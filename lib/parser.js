var utils = require('./utils'),
  lexer = require('./lexer');

var _t = lexer.types;

/*!
 * Makes a string safe for a regular expression.
 * @param  {string} str
 * @return {string}
 * @api private
 */
function escapeRegExp(str) {
  return str.replace(/[\-\/\\\^$*+?.()|\[\]{}]/g, '\\$&');
}

/**
 * Parse strings of variables and tags into tokens for future compilation.
 * @param {array}  tokens  Pre-split tokens read by the Lexer.
 * @param {object} filters Keyed object of filters that may be applied to variables.
 * @param {number} line    Beginning line number for the first token.
 * @api private
 */
function TokenParser(tokens, filters, line) {
  this.out = [];
  this.state = [];
  this.filterApplyIdx = [];
  this._parsers = {};
  this.line = line;
  this.filters = filters;

  this.parse = function () {
    var self = this;

    utils.each(tokens, function (token, i) {
      self.prevToken = tokens[i - 1];
      self.isLast = (i === tokens.length - 1);
      self.parseToken(token);
    });

    return self.out;
  };
}

TokenParser.prototype = {
  /**
   * Set a custom method to be called when a token type is found.
   *
   * @example
   *
   * parser.on(types.STRING, function (token) {
   *   this.out.push(token.match);
   * });
   *
   * @param  {number}   type Token type ID. Found in the Lexer.
   * @param  {Function} fn   Callback function. Return true to continue executing the default parsing function.
   * @return {undefined}
   */
  on: function (type, fn) {
    this._parsers[type] = fn;
  },

  /**
   * Parse a single token.
   * @param  {{match: string, type: number, line: number}} token Lexer token object.
   * @return {undefined}
   * @api private
   */
  parseToken: function (token) {
    var self = this,
      fn = self._parsers[token.type] || self._parsers['*'],
      match = token.match,
      prevToken = self.prevToken,
      lastState = (self.state.length) ? self.state[self.state.length - 1] : null,
      temp;

    if (fn && typeof fn === 'function') {
      if (!fn.call(this, token)) {
        return;
      }
    }

    if (lastState &&
        lastState === _t.FILTER &&
        prevToken.type === _t.FILTER &&
        token.type !== _t.PARENCLOSE &&
        token.type !== _t.COMMA &&
        token.type !== _t.OPERATOR &&
        token.type !== _t.FILTER &&
        token.type !== _t.FILTEREMPTY) {
      self.out.push(', ');
    }

    switch (token.type) {
    case _t.WHITESPACE:
      break;

    case _t.STRING:
      self.out.push(match.replace(/\\/g, '\\\\'));
      self.filterApplyIdx.push(self.out.length - 1);
      break;

    case _t.NUMBER:
      self.out.push(match);
      self.filterApplyIdx.push(self.out.length - 1);
      break;

    case _t.FILTER:
      if (!self.filters.hasOwnProperty(match) || typeof self.filters[match] !== "function") {
        throw new Error('Invalid filter "' + match + '" found on line ' + self.line + '.');
      }
      self.out.splice(self.filterApplyIdx[self.filterApplyIdx.length - 1], 0, '_filters["' + match + '"](');
      self.state.push(token.type);
      break;

    case _t.FILTEREMPTY:
      if (!self.filters.hasOwnProperty(match) || typeof self.filters[match] !== "function") {
        throw new Error('Invalid filter "' + match + '" found on line ' + self.line + '.');
      }
      self.out.splice(self.filterApplyIdx[self.filterApplyIdx.length - 1], 0, '_filters["' + match + '"](');
      self.out.push(')');
      break;

    case _t.FUNCTION:
      self.state.push(token.type);
      self.out.push('((typeof ' + match + ' !== "undefined") ? ' + match +
        ' : ((typeof _ctx.' + match + ' !== "undefined") ? _ctx.' + match +
        ' : _fn))(');
      self.filterApplyIdx.push(self.out.length - 1);
      break;

    case _t.PARENOPEN:
      if (self.filterApplyIdx.length) {
        self.out.splice(self.filterApplyIdx[self.filterApplyIdx.length - 1], 0, '(');
        self.out.push(' || _fn)(');
      } else {
        self.out.push('(');
      }
      self.state.push(token.type);
      self.filterApplyIdx.push(self.out.length - 1);
      break;

    case _t.PARENCLOSE:
      temp = self.state.pop();
      if (temp !== _t.PARENOPEN && temp !== _t.FUNCTION && temp !== _t.FILTER) {
        throw new Error('Mismatched nesting state on line ' + self.line + '.');
      }
      self.out.push(')');
      self.filterApplyIdx.pop();
      break;

    case _t.COMMA:
      if (lastState !== _t.FUNCTION &&
          lastState !== _t.FILTER &&
          lastState !== _t.ARRAYOPEN &&
          lastState !== _t.CURLYOPEN &&
          lastState !== _t.PARENOPEN) {
        throw new Error('Unexpected comma on line ' + self.line + '.');
      }
      self.out.push(', ');
      self.filterApplyIdx.pop();
      break;

    case _t.VAR:
      self.parseVar(token, match, lastState, prevToken);
      break;

    case _t.BRACKETOPEN:
      if (!prevToken ||
          (prevToken.type !== _t.VAR &&
            prevToken.type !== _t.BRACKETCLOSE &&
            prevToken.type !== _t.PARENCLOSE)) {
        self.state.push(_t.ARRAYOPEN);
        self.filterApplyIdx.push(self.out.length);
      } else {
        self.state.push(token.type);
      }
      self.out.push('[');
      break;

    case _t.BRACKETCLOSE:
      temp = self.state.pop();
      if (temp !== _t.BRACKETOPEN && temp !== _t.ARRAYOPEN) {
        throw new Error('Unexpected closing square bracket on line ' + self.line + '.');
      }
      self.out.push(']');
      self.filterApplyIdx.pop();
      break;

    case _t.CURLYOPEN:
      self.state.push(token.type);
      self.out.push('{');
      self.filterApplyIdx.push(self.out.length - 1);
      break;

    case _t.COLON:
      if (lastState !== _t.CURLYOPEN) {
        throw new Error('Unexpected colon on line ' + self.line + '.');
      }
      self.out.push(':');
      self.filterApplyIdx.pop();
      break;

    case _t.CURLYCLOSE:
      if (self.state.pop() !== _t.CURLYOPEN) {
        throw new Error('Unexpected closing curly brace on line ' + self.line + '.');
      }
      self.out.push('}');

      self.filterApplyIdx.pop();
      break;

    case _t.DOTKEY:
      if (prevToken.type !== _t.VAR && prevToken.type !== _t.BRACKETCLOSE && prevToken.type !== _t.DOTKEY) {
        throw new Error('Unexpected key "' + match + '" on line ' + self.line + '.');
      }
      self.out.push('.' + match);
      break;

    case _t.OPERATOR:
      self.out.push(' ' + match + ' ');
      self.filterApplyIdx.pop();
      break;
    }
  },

  /**
   * Parse variable token
   * @param  {{match: string, type: number, line: number}} token      Lexer token object.
   * @param  {string} match       Shortcut for token.match
   * @param  {number} lastState   Lexer token type state.
   * @param  {{match: string, type: number, line: number}} prevToken  Lexer token object.
   * @return {undefined}
   * @api private
   */
  parseVar: function (token, match, lastState, prevToken) {
    var self = this,
      temp;

    match = match.split('.');
    self.filterApplyIdx.push(self.out.length);
    if (lastState === _t.CURLYOPEN) {
      if (match.length > 1) {
        throw new Error('Unexpected dot on line ' + self.line + '.');
      }
      self.out.push(match[0]);
      return;
    }
    temp = match[0];

    function checkDot(ctx) {
      var c = ctx + temp,
        m = match,
        build = '';

      build = '(typeof ' + c + ' !== "undefined"';
      utils.each(m, function (v, i) {
        if (i === 0) {
          return;
        }
        build += ' && ' + c + '.hasOwnProperty("' + v + '")';
        c += '.' + v;
      });
      build += ')';

      return build;
    }

    function buildDot(ctx) {
      return '(' + checkDot(ctx) + ' ? ' + ctx + match.join('.') + ' : "")';
    }

    self.out.push('(' + checkDot('') + ' ? ' + buildDot('') + ' : ' + buildDot('_ctx.') + ')');
  }
};

/**
 * Parse a source string into tokens that are ready for compilation.
 *
 * @example
 *
 * exports.parse('{{ tacos }}', {}, tags, filters);
 * // => [{ compile: [Function], ... }]
 *
 * @param  {string} source  Swig template source.
 * @param  {object} opts    Swig options object.
 * @param  {object} tags    Keyed object of tags that can be parsed and compiled.
 * @param  {object} filters Keyed object of filters that may be applied to variables.
 * @return {array}          List of tokens ready for compilation.
 */
exports.parse = function (source, opts, tags, filters) {
  source = source.replace(/\r\n/g, '\n');
  var escape = opts.autoescape,
    tagOpen = opts.tagControls[0],
    tagClose = opts.tagControls[1],
    varOpen = opts.varControls[0],
    varClose = opts.varControls[1],
    escapedTagOpen = escapeRegExp(tagOpen),
    escapedTagClose = escapeRegExp(tagClose),
    escapedVarOpen = escapeRegExp(varOpen),
    escapedVarClose = escapeRegExp(varClose),
    tagStrip = new RegExp('^' + escapedTagOpen + '-?\\s*-?|-?\\s*-?' + escapedTagClose + '$', 'g'),
    tagStripBefore = new RegExp('^' + escapedTagOpen + '-'),
    tagStripAfter = new RegExp('-' + escapedTagClose + '$'),
    varStrip = new RegExp('^' + escapedVarOpen + '-?\\s*-?|-?\\s*-?' + escapedVarClose + '$', 'g'),
    varStripBefore = new RegExp('^' + escapedVarOpen + '-'),
    varStripAfter = new RegExp('-' + escapedVarClose + '$'),
    cmtOpen = opts.cmtControls[0],
    cmtClose = opts.cmtControls[1],
    // Split the template source based on variable, tag, and comment blocks
    // /(\{\{.*?\}\}|\{\%.*?\%\}|\{\#[^.*?\#\})/
    splitter = new RegExp(
      '(' +
        escapedTagOpen + '.*?' + escapedTagClose + '|' +
        escapedVarOpen + '.*?' + escapedVarClose + '|' +
        escapeRegExp(cmtOpen) + '.*?' + escapeRegExp(cmtClose) +
        ')'
    ),
    line = 1,
    stack = [],
    parent = null,
    tokens = [],
    blocks = {},
    inRaw = false,
    stripNext;

  /**
   * Parse a variable.
   * @param  {string} str  String contents of the variable, between <i>{{</i> and <i>}}</i>
   * @param  {number} line The line number that this variable starts on.
   * @return {{compile: Function}}      Parsed token object.
   * @api private
   */
  function parseVariable(str, line) {
    var tokens = lexer.read(utils.strip(str)),
      parser,
      addescape,
      out;

    addescape = escape && !(utils.some(tokens, function (token) {
      return (token.type === _t.FILTEREMPTY || token.type === _t.FILTER) && token.match === 'raw';
    }));

    if (addescape) {
      tokens.unshift({ type: _t.PARENOPEN, match: '(' });
      tokens.push({ type: _t.PARENCLOSE, match: ')' });
      tokens.push({
        type: _t.FILTEREMPTY,
        match: 'e'
      });
    }

    parser = new TokenParser(tokens, filters, line);
    out = parser.parse().join('');

    if (parser.state.length) {
      throw new Error('Unable to parse "' + str + '" on line ' + line + '.');
    }

    return {
      compile: function () {
        return '_output += ' + out + ';\n';
      }
    };
  }
  exports.parseVariable = parseVariable;

  /**
   * Parse a tag.
   * @param  {string} str  String contents of the tag, between <i>{%</i> and <i>%}</i>
   * @param  {number} line The line number that this tag starts on.
   * @return {{compile: Function, args: Array, content: object, ends: boolean, name: string}}      Parsed token object.
   * @api private
   */
  function parseTag(str, line) {
    var tokens, parser, chunks, tagName, tag, args, last;

    if (utils.startsWith(str, 'end')) {
      last = stack[stack.length - 1];
      if (last.name === str.replace(/^end/, '') && last.ends) {
        switch (last.name) {
        case 'autoescape':
          escape = opts.autoescape;
          break;
        case 'raw':
          inRaw = false;
          break;
        }
        stack.pop();
        return;
      }

      if (!inRaw) {
        throw new Error('Unexpected end of tag "' + str.replace(/^end/, '') + '" on line ' + line + '. of ' + opts.filename);
      }
    }

    if (inRaw) {
      return;
    }

    chunks = str.split(/\s+(.+)?/);
    tagName = chunks.shift();

    if (!tags.hasOwnProperty(tagName)) {
      throw new Error('Unexpected tag "' + str + '" on line ' + line + '.');
    }

    tokens = lexer.read(utils.strip(chunks.join(' ')));
    parser = new TokenParser(tokens, filters, line);
    tag = tags[tagName];

    if (!tag.parse(chunks[1], line, parser, _t, stack)) {
      throw new Error('Unexpected tag "' + tagName + '" on line ' + line + '.');
    }

    parser.parse();
    args = parser.out;

    switch (tagName) {
    case 'autoescape':
      escape = (args[0] === 'true');
      break;
    case 'raw':
      inRaw = true;
      break;
    }

    return {
      compile: tag.compile,
      args: args,
      content: [],
      ends: tag.ends,
      name: tagName
    };
  }

  /**
   * Strip the whitespace from the previous token, if it is a string.
   * @param  {object} token Parsed token.
   * @return {object}       If the token was a string, trailing whitespace will be stripped.
   */
  function stripPrevToken(token) {
    if (typeof token === 'string') {
      token = token.replace(/\s*$/, '');
    }
    return token;
  }

  /*!
   * Loop over the source, split via the tag/var/comment regular expression splitter.
   * Send each chunk to the appropriate parser.
   */
  utils.each(source.split(splitter), function (chunk) {
    var token, lines, stripPrev, prevToken, prevChildToken;

    if (!chunk) {
      return;
    }

    // Is a variable?
    if (!inRaw && utils.startsWith(chunk, varOpen) && utils.endsWith(chunk, varClose)) {
      stripPrev = varStripBefore.test(chunk);
      stripNext = varStripAfter.test(chunk);
      token = parseVariable(chunk.replace(varStrip, ''), line);
    // Is a tag?
    } else if (utils.startsWith(chunk, tagOpen) && utils.endsWith(chunk, tagClose)) {
      stripPrev = tagStripBefore.test(chunk);
      stripNext = tagStripAfter.test(chunk);
      token = parseTag(chunk.replace(tagStrip, ''), line);
      if (token) {
        switch (token.name) {
        case 'extends':
          parent = token.args.join('').replace(/^\'|\'$/g, '').replace(/^\"|\"$/g, '');
          break;
        case 'block':
          blocks[token.args.join('')] = token;
          break;
        }
      }
      if (inRaw && !token) {
        token = chunk;
      }
    // Is a content string?
    } else if (inRaw || (!utils.startsWith(chunk, cmtOpen) && !utils.endsWith(chunk, cmtClose))) {
      token = (stripNext) ? chunk.replace(/^\s*/, '') : chunk;
      stripNext = false;
    }

    // Did this tag ask to strip previous whitespace? <code>{%- ... %}</code> or <code>{{- ... }}</code>
    if (stripPrev && tokens.length) {
      prevToken = tokens.pop();
      if (typeof prevToken === 'string') {
        prevToken = stripPrevToken(prevToken);
      } else if (prevToken.content && prevToken.content.length) {
        prevChildToken = stripPrevToken(prevToken.content.pop());
        prevToken.content.push(prevChildToken);
      }
      tokens.push(prevToken);
    }

    // This was a comment, so let's just keep going.
    if (!token) {
      return;
    }

    // If there's an open item in the stack, add this to its content.
    if (stack.length) {
      stack[stack.length - 1].content.push(token);
    } else {
      tokens.push(token);
    }

    // If the token is a tag that requires an end tag, open it on the stack.
    if (token.name && token.ends) {
      stack.push(token);
    }

    lines = chunk.match(/\n/g);
    line += (lines) ? lines.length : 0;
  });

  return {
    name: opts.filename,
    parent: parent,
    tokens: tokens,
    blocks: blocks
  };
};

exports.compile = function (template, parent, options, blockName) {
  var out = '',
    tokens = utils.isArray(template) ? template : template.tokens;

  utils.each(tokens, function (token, index) {
    if (typeof token === 'string') {
      out += '_output += "' + token.replace(/\n|\r/g, '\\n').replace(/"/g, '\\"') + '";\n';
      return;
    }

    out += token.compile(exports.compile, token.args, token.content, parent, options, blockName);
  });

  return out;
};
