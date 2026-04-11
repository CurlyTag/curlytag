# Getting Started

## Installation

::: code-group

```sh [npm]
npm install @curlytag/curlytag
```

```sh [pnpm]
pnpm add @curlytag/curlytag
```

```sh [Bun]
bun add @curlytag/curlytag
```

:::

Or drop the file directly into your project - CurlyTag ships as a single `curlytag.js` with no build step required.

## Basic Usage

```js
import { template } from '@curlytag/curlytag';

template.parse('Hello, {{ name }}!', { name: 'World' });
// → Hello, World!
```

## Async Rendering

`template.render()` loads a template from disk (Node / Bun / Deno) or via `fetch` (browser):

```js
template.addPath('views/');
const html = await template.render('home', { title: 'Welcome' });
```

Files are resolved relative to the path set with `addPath`. The `.html` extension is added automatically.

## CDN / Browser

```html
<script type="module">
    import { template } from 'https://cdn.jsdelivr.net/npm/@curlytag/curlytag/curlytag.js';

    const html = template.parse('{{ greeting }}!', { greeting: 'Hello' });
    document.body.textContent = html;
</script>
```
