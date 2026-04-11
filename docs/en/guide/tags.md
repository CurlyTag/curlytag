# Tags

## Conditions

### if / elseif / else

```liquid
{% if user.is_admin %}
  Welcome, admin!
{% elseif user.is_moderator %}
  Welcome, moderator!
{% else %}
  Hello, {{ user.name }}!
{% endif %}
```

### unless

`unless` is the inverse of `if`:

```liquid
{% unless user.verified %}
  Please verify your email.
{% endunless %}
```

## Loops

```liquid
{% for item in items %}
  {{ loop.index }}. {{ item }}
{% endfor %}
```

### Loop variables

| Variable | Description |
|---|---|
| `loop.index` | 1-based iteration count |
| `loop.index0` | 0-based iteration count |
| `loop.first` | `true` on the first iteration |
| `loop.last` | `true` on the last iteration |
| `loop.length` | Total number of items |
| `loop.rindex` | Remaining iterations (1-based) |
| `loop.rindex0` | Remaining iterations (0-based) |

### continue / break

```liquid
{% for item in items %}
  {% if item.hidden %}{% continue %}{% endif %}
  {{ item.name }}
{% endfor %}
```

## Assign

Store a computed value for later use:

```liquid
{% assign greeting = "hello" | upper %}
{{ greeting }}, {{ name }}!
```

## Case / When

```liquid
{% case status %}
  {% when "active" %}
    Active
  {% when "inactive" %}
    Inactive
  {% else %}
    Unknown
{% endcase %}
```

## Echo

Outputs a value with optional filters as a tag instead of `{{ }}`:

```liquid
{% echo name | upper %}
```

## Capture

Renders a block and stores the result in a variable:

```liquid
{% capture sidebar %}
  <nav>...</nav>
{% endcapture %}

{{ sidebar }}
```

## Include

Renders another template file inline:

```liquid
{% include path/to/partial %}
```

The path is resolved relative to the directory set with `template.addPath()`.

## Filter (block)

Applies a filter to an entire rendered block:

```liquid
{% filter upper %}
  this will be uppercased
{% endfilter %}
```

## Raw

Outputs content without parsing - useful for documenting CurlyTag itself:

```liquid
{% raw %}
  {{ this will not be parsed }}
{% endraw %}
```

## Comment

Block comment - removed from output entirely:

```liquid
{% comment %}
  This will not appear in the output.
{% endcomment %}
```

Inline comment:

```liquid
{# This will not appear in the output. #}
```
