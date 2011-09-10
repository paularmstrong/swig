# Template Inheritance

Swig borrows much of its implementation from Django's templates–template inheritance with `extends` and `block`s are no exception.

Unlike other, more basic template languages, Swig is able to render a single template that extends from multiple templates in a chain in a very powerful way.

## Basic Example

### layout.html

<script src="https://gist.github.com/1208919.js?file=layout.html"></script>

### child.html

<script src="https://gist.github.com/1208919.js?file=child.html"></script>

### Output

Notice that `child.html` only implements the title and content block. So, any blocks in the parent that are not implemented by the child will use the default content from the parent layout.

<script src="https://gist.github.com/1208919.js?file=output.html"></script>