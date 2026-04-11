# Custom Filters

Register a filter with `template.addFilter(name, fn)`. The function receives the value and any arguments passed in the template.

## Example

```js
import { template } from '@curlytag/curlytag';

template.addFilter('capitalize', (value) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
});
```

```liquid
{{ "hello world" | capitalize }}
```

Output:

```
Hello world
```

## Arguments

Arguments after `:` are passed as additional parameters:

```js
template.addFilter('repeat', (value, times) => {
    return value.repeat(Number(times));
});
```

```liquid
{{ "ha" | repeat: 3 }}
```

Output:

```
hahaha
```

## Chaining

Custom filters chain with built-in filters normally:

```liquid
{{ "hello world" | capitalize | append: "!" }}
```
