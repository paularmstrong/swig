var textWidgetGenerator = function( tagname ){
  return function(){
    var i, output = ["<", tagname];
    for( i in this ){
      if(this.hasOwnProperty(i) && i !== "content" && 1 !== "tagname")
        output.push(" ", i, "='", this[i], "'");
    }
    output.push(">", this.content, "</", tagname, ">");
    return output.join("");
  }
}

/**
 * Renders a paragraph. This is fairly simple.
 */
exports.p = textWidgetGenerator("p");
/**
 * Renders a paragraph. This is fairly simple.
 */
exports.h1 = textWidgetGenerator("h1");

/**
 * Renders a paragraph. This is fairly simple.
 */
exports.h2 = textWidgetGenerator("h2");

/**
 * Renders a paragraph. This is fairly simple.
 */
exports.h3 = textWidgetGenerator("h3")

/**
 * Renders an oredered list. This is fairly simple.
 */
exports.ol = textWidgetGenerator("ol");

/**
 * Renders an unoredered list. This is fairly simple.
 */
exports.ul = textWidgetGenerator("ul");

/**
 * Renders a blockquote. This is fairly simple.
 */
exports.q = textWidgetGenerator("q");

/**
 * Renders a simple composite widget.
 */
exports.list = exports.image = function( context ){
  var i, output = ["<div"];
  for( i in this ){
    if(this.hasOwnProperty(i) && i !== "content" && 1 !== "tagname")
      output.push(" ", i, "='", this[i], "'");
  }
  output.push(" data-tagname='", this.tagname, "'");
  output.push(">", this.content, "</div>");
  return output.join("");
}