# curlytag

CurlyTag - Open Source JavaScript Template Engine

## Documentation

```js
import { template } from './curlytag.js';

template.parse('Hello, {{ name }}!', { name: 'World' });
// → Hello, World!
```

### Async rendering

```js
template.addPath('views/');
const html = await template.render('home', { title: 'Welcome' });
```

## Output

Variables are auto-escaped by default:

```
{{ user.name }}
{{ price | round: 2 }}
{{ bio | default: "No bio" }}
```

## Tags

### Conditions

```
{% if user.is_admin %}
  Welcome, admin!
{% elseif user.is_moderator %}
  Welcome, moderator!
{% else %}
  Hello, {{ user.name }}!
{% endif %}
```

```
{% unless user.verified %}
  Please verify your email.
{% endunless %}
```

### Loops

```
{% for item in items %}
  {{ loop.index }}. {{ item }}
{% endfor %}
```

Loop variables: `loop.index`, `loop.index0`, `loop.first`, `loop.last`, `loop.length`, `loop.rindex`, `loop.rindex0`.

`{% continue %}` and `{% break %}` are supported.

### Set

```
{% set greeting = "hello" | upper %}
```

### Switch

```
{% switch status %}
  {% case "active" %}
    Active
  {% case "inactive" %}
    Inactive
  {% else %}
    Unknown
{% endswitch %}
```

### Block

Captures content into a variable:

```
{% block sidebar %}
  <nav>...</nav>
{% endblock %}
```

### Include

```
{% include path/to/template %}
```

### Filter (block)

Applies a filter to an entire block:

```
{% filter upper %}
  this will be uppercased
{% endfilter %}
```

### Raw

Outputs content without parsing:

```
{% raw %}
  {{ this will not be parsed }}
{% endraw %}
```

### Comment

```
{% comment %}
  This will not appear in the output.
{% endcomment %}
```

## Filters

### String

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

### HTML

| Filter | Example | Description |
|---|---|---|
| `escape` / `e` | `{{ html \| escape }}` | Escapes `& < > " '` |
| `nl2br` | `{{ text \| nl2br }}` | Newlines → `<br/>` |
| `striptag` | `{{ html \| striptag }}` | Removes all HTML tags |

### Array

| Filter | Description |
|---|---|
| `sort` | Sort by key and direction: `sort: "name", "desc"` |
| `reverse` | Reverse array or string |
| `first` / `last` | First or last element |
| `join` | Join elements: `join: ", "` |
| `slice` | Slice: `slice: 0, 3` |
| `limit` | Offset + limit: `limit: 0, 5` |
| `length` | Number of elements |
| `concat` | Concatenate arrays |
| `batch` | Split into chunks: `batch: 3` |
| `groupby` | Group by type |
| `push` / `pop` | Add/remove from end |
| `shift` / `unshift` | Remove/add from start |
| `select` / `reject` | Filter by truthy/falsy key |
| `random` | Random element |
| `sum` | Sum all numeric elements |

### Math

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

### Utility

| Filter | Description |
|---|---|
| `default` | Fallback value: `default: "N/A"` |
| `dump` | JSON.stringify |
| `safe` | Output without escaping |
| `urlencode` | `encodeURIComponent` |
| `urldecode` | `decodeURIComponent` |

## Custom Filters

```js
template.addFilter('capitalize', (value) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
});
```
