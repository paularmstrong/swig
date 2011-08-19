# Variable Filters

Used to modify variables. Filters are added directly after variable names, separated by the pipe (|) character. You can chain multiple filters together, applying one after the other in succession.

    {{ foo|reverse|join(' ')|title }}

## default(default_value)

If the variable is `undefined`, `null`, or `false`, a default return value can be specified.

    {{ foo|default('foo is not defined') }}

## lower

Return the variable in all lowercase letters.

## upper

Return the variable in all uppercase letters

## capitalize

Capitalize the first character in the string.

## title

Change the output to title case–the first letter of every word will uppercase, while all the rest will be lowercase.

## join

If the value is an Array, you can join each value with a delimiter and return it as a string.

    {{ authors|join(', ') }}

## reverse

If the value is an Array, this filter will reverse all items in the array.

## length

Return the `length` property of the value.

## url_encode

Encode a URI component.

## url_decode

Decode a URI component.

## json_encode

Return a JSON string of the variable.

## striptags

Strip all HTML/XML tags.

## date

Convert a valid date into a format as specified. Mostly conforms to (php.net's date formatting)[http://php.net/date].

    {{ post.created|date('F jS, Y') }}
