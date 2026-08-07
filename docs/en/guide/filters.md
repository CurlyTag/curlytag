# Filters

Filters transform output values. Apply them with `|` after a variable or value:

```liquid
{{ value | filter_name }}
{{ value | filter_name: arg1, arg2 }}
{{ value | filter1 | filter2 }}
```

## String

::: v-pre
| Filter | Example | Result |
|---|---|---|
| `lower` | `{{ "HELLO" \| lower }}` | `hello` |
| `upper` | `{{ "hello" \| upper }}` | `HELLO` |
| `trim` | `{{ "  hi  " \| trim }}` | `hi` |
| `ltrim` | `{{ "  hi" \| ltrim }}` | `hi` |
| `rtrim` | `{{ "hi  " \| rtrim }}` | `hi` |
| `replace` | `{{ "hello" \| replace: "l", "r" }}` | `herro` |
| `replace_first` | `{{ "hello" \| replace_first: "l", "r" }}` | `herlo` |
| `split` | `{{ "a,b,c" \| split: "," }}` | `['a','b','c']` |
| `append` | `{{ "hello" \| append: "!" }}` | `hello!` |
| `prepend` | `{{ "world" \| prepend: "hello " }}` | `hello world` |
| `truncate` | `{{ "long text" \| truncate: 7 }}` | `long...` |
| `wordcount` | `{{ "one two three" \| wordcount }}` | `3` |
:::

## HTML

::: v-pre
| Filter | Example | Description |
|---|---|---|
| `escape` / `e` | `{{ html \| escape }}` | Escapes `& < > " '` |
| `nl2br` | `{{ text \| nl2br }}` | Newlines → `<br/>` |
| `striptag` | `{{ html \| striptag }}` | Removes all HTML tags |
:::

## Array

| Filter | Description |
|---|---|
| `sort` | Sort by key and direction: `sort: "name", "desc"` |
| `reverse` | Reverse array or string |
| `first` / `last` | First or last element |
| `join` | Join elements: `join: ", "` |
| `slice` | Slice from index: `slice: 2` |
| `offset` | Skip first N elements: `offset: 3` |
| `limit` | Take first N elements: `limit: 5` |
| `length` | Number of elements |
| `concat` | Concatenate arrays |
| `batch` | Split into chunks: `batch: 3` |
| `push` / `pop` | Add/remove from end |
| `shift` / `unshift` | Remove/add from start |
| `random` | Random element |
| `sum` | Sum all numeric elements |

## Math

::: v-pre
| Filter | Example | Result |
|---|---|---|
| `plus` | `{{ 5 \| plus: 3 }}` | `8` |
| `minus` | `{{ 5 \| minus: 3 }}` | `2` |
| `times` | `{{ 5 \| times: 3 }}` | `15` |
| `divide` | `{{ 10 \| divide: 2 }}` | `5` |
| `round` | `{{ 3.456 \| round: 2 }}` | `3.46` |
| `ceil` | `{{ 3.2 \| ceil }}` | `4` |
| `floor` | `{{ 3.8 \| floor }}` | `3` |
| `abs` | `{{ -5 \| abs }}` | `5` |
| `modulo` | `{{ 10 \| modulo: 3 }}` | `1` |
:::

## Utility

| Filter | Description |
|---|---|
| `default` | Fallback value: `default: "N/A"` |
| `dump` | `JSON.stringify` the value |
| `safe` | Returns empty string for `null`/`undefined` |
| `urlencode` | `encodeURIComponent` |
| `urldecode` | `decodeURIComponent` |
