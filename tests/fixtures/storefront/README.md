# Storefront compatibility fixtures

These files are original test fixtures written for CurlyTag. They reproduce template-language
constructs observed in the OpenCart storefront, but do not copy or derive from OpenCart templates
or markup.

Keep the fixtures small and focused so compatibility regressions can be understood without
including third-party source material.

## Where each construct comes from

OpenCart renders its entire storefront with CurlyTag - 73 `.html` templates under
`upload/catalog/view/template/`. Each fixture below reproduces a construct found there, so the
links say *why* the test exists.

Links are pinned to commit [`01254c2`][pin] rather than `master`, so the line numbers stay valid.
Base path for every link: `upload/catalog/view/template/`.

[pin]: https://github.com/opencart/opencart/tree/01254c2138915763c3a86139e24b26c33b3aeb17

### `rating-stars.html` - integer ranges in `for`

`{% for i in 1..5 %}` combined with a comparison in `if`. This is the star-rating widget, so it
appears on every product card.

- [`catalog/review_list.html#L11`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/catalog/review_list.html#L11)
- [`catalog/product_thumb.html#L18`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/catalog/product_thumb.html#L18)
- [`catalog/product_info.html#L42`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/catalog/product_info.html#L42)
- [`catalog/compare.html#L56`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/catalog/compare.html#L56)

### `filter-args.html` - colon-style filter arguments

`{{ value | filter: 'arg', variable }}`. The second line of the fixture passes an *undefined*
variable as an argument - that is what used to throw `TypeError: args is not iterable` and take
down the whole render.

- [`common/header.html#L34`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/common/header.html#L34) - `replace` with an undefined variable (source of the crash)
- [`common/footer.html#L45`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/common/footer.html#L45) - two chained `replace_first` (source of the crash)
- [`catalog/product_info.html#L228`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/catalog/product_info.html#L228) - four chained `replace_first`, mixing `%s` and `%d`
- [`component/menu.html#L12`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/component/menu.html#L12) - `| divide: 4 | round`

### `format.html` - parenthesised filter calls

`{{ value | format(a, b) }}`. OpenCart language strings carry `%s` placeholders, and the `format`
filter fills them with the supplied arguments. Note that three of the six call sites apply the
filter to a *string literal inside a condition*, not to a variable.

This fixture is excluded from Oxfmt in `vite.config.ts`: the HTML formatter interprets Twig inside
an attribute as malformed HTML and rewrites the template syntax.

- [`information/gdpr.html#L2`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/information/gdpr.html#L2) - three arguments
- [`information/gdpr.html#L30`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/information/gdpr.html#L30), [`#L32`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/information/gdpr.html#L32) - one argument
- [`catalog/search.html#L54`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/catalog/search.html#L54) - `{% if sorts.value == '%s-%s'|format(sort, order) %}`
- same literal-in-condition shape in [`catalog/special.html#L19`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/catalog/special.html#L19) and [`cms/comment.html#L22`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/cms/comment.html#L22)

### `set-counter.html` - the `set` tag

`{% set name = value %}` as a synonym for `assign`, including re-assignment for a counter that is
incremented inside a loop.

- [`account/order_info.html#L69`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/account/order_info.html#L69) - initialise
- [`account/order_info.html#L126`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/account/order_info.html#L126) - increment inside `for`
- [`account/wishlist_list.html#L15`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/account/wishlist_list.html#L15), [`#L46`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/account/wishlist_list.html#L46) - same pair

### `reserved-words.html` - JS keywords as variable names

`{{ continue }}` is a data key in OpenCart (the "continue shopping" URL), but a reserved word in
JavaScript, so naive expression evaluation fails to parse it. 17 occurrences across 16 templates.

- [`common/success.html#L3`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/common/success.html#L3)
- [`checkout/cart.html#L111`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/checkout/cart.html#L111)
- [`catalog/compare.html#L119`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/catalog/compare.html#L119)

`continue` is not the only one. Two more JS keywords are used as data keys:

- `return` - [`extension/opencart/catalog/view/template/module/account.html#L19`](https://github.com/opencart/opencart/blob/01254c2/upload/extension/opencart/catalog/view/template/module/account.html#L19)
- `default` - [`account/address.html#L221`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/account/address.html#L221) and [`#L224`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/account/address.html#L224), as `{% if default %}` / `{% if not default %}`

### `filter-chain.html` - both filter call styles feeding a loop

OpenCart writes filter calls two ways, and `batch` is the one filter written both ways, so the
spellings have to stay interchangeable. The fixture also carries the chained condition from the
banner module, which is the shape behind defect 8 - filters in `{% if %}` only work in the
parenthesised form.

- [`extension/.../module/banner.html#L2`](https://github.com/opencart/opencart/blob/01254c2/upload/extension/opencart/catalog/view/template/module/banner.html#L2) - `banners|batch(items)|length > 1`
- [`extension/.../module/banner.html#L5`](https://github.com/opencart/opencart/blob/01254c2/upload/extension/opencart/catalog/view/template/module/banner.html#L5) - `{% for banner in banners|batch(items) %}`
- [`catalog/category.html#L38`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/catalog/category.html#L38) - the same `batch`, spelled with a colon

### `nav-blocks.html` - nested `if` / `for` / `else`

No single line to point at; this reproduces the overall shape of the header, footer and menu
components, which nest loops and conditionals several levels deep. It guards against regressions
in block bookkeeping rather than a specific defect.

- [`common/header.html`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/common/header.html)
- [`common/footer.html`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/common/footer.html)
- [`component/menu.html`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/component/menu.html)

## Current support

Only the colon spelling of filter calls is supported. `format.html` and `filter-chain.html`
therefore describe what the storefront needs rather than what the engine does: their
parenthesised calls are red tests, and a parenthesised call feeding a loop throws outright
because `parseFilter` returns `undefined` for the unrecognised name and `handleFor` reads
`.length` off it.

Filters are never applied inside `{% if %}` either, in any spelling - `handleIf` hands the
whole expression to `evaluate()`, where `|` stays a bitwise OR.

## Deliberate additions

Some fixtures cover slightly more than OpenCart currently uses. These are ours, not observations,
and are marked here so nobody goes looking for a source that does not exist:

- `reserved-words.html` also exercises `{{ class }}`, which does not appear anywhere in OpenCart.
  It is included because the underlying defect is generic. `continue` and `return` are *not*
  additions - see the section above.
- `set-counter.html` reads `loop.index`. OpenCart only uses `loop.last`, in
  [`catalog/product_info.html#L282`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/catalog/product_info.html#L282) and
  [`cms/article_info.html#L10`](https://github.com/opencart/opencart/blob/01254c2/upload/catalog/view/template/cms/article_info.html#L10).
