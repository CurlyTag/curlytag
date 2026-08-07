# Output

## Variables

Variables are rendered with `{{ }}`. Nested properties and array indexes are accessed with dot notation:

```liquid
{{ user.name }}
{{ items[0] }}
{{ order.address.city }}
```

Values are **auto-escaped** by default - `&`, `<`, `>`, `"`, and `'` are converted to their HTML entities.

## Filters

Filters transform the output value. Chain them with `|`:

```liquid
{{ price | round: 2 }}
{{ bio | default: "No bio" }}
{{ name | upper | trim }}
```

See the full [Filters](/guide/filters) reference for all available filters.

## Whitespace Control

Add `-` inside an output delimiter to strip whitespace from the value:

```liquid
{{- name -}}
```

`-` on the left trims leading whitespace from the value; `-` on the right trims trailing whitespace.
