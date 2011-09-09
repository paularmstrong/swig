# Variable Filters

Used to modify variables. Filters are added directly after variable names, separated by the pipe (|) character. You can chain multiple filters together, applying one after the other in succession.

    {{ foo|reverse|join(' ')|title }}

## add(value)

Adds the value to the variable. Strings that can be converted to integers will be summed, not concatenated, as in the example below.

    {{ value|add('2') }}

## addslashes

Returns a string with backslashes in front of characters that need to be quoted for database queries, etc.

* single quote `'`
* double quote `"`
* backslash `\`

## capitalize

Capitalize the first character in the string.

## date

Convert a valid date into a format as specified. Mostly conforms to (php.net's date formatting)[http://php.net/date].

    {{ post.created|date('F jS, Y') }}

## default(default_value)

If the variable is `undefined`, `null`, or `false`, a default return value can be specified.

    {{ foo|default('foo is not defined') }}

## first

Returns the first element of an array. Uses [underscore.js first](http://documentcloud.github.com/underscore/#first)

## join

If the value is an Array, you can join each value with a delimiter and return it as a string.

    {{ authors|join(', ') }}

## json_encode

Return a JSON string of the variable.

## last

Returns the last element of an array. Uses [underscore.js last](http://documentcloud.github.com/underscore/#last)

## length

Return the `length` property of the value.

## lower

Return the variable in all lowercase letters.

## reverse

If the value is an Array, this filter will reverse all items in the array.

## striptags

Strip all HTML/XML tags.

## title

Change the output to title case–the first letter of every word will uppercase, while all the rest will be lowercase.

## uniq

Produces a duplicate-free version of the array. Uses [underscore.js uniq](http://documentcloud.github.com/underscore/#uniq)

## upper

Return the variable in all uppercase letters

## url_encode

Encode a URI component.

## url_decode

Decode a URI component.
