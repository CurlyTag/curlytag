# Development

## Dev Container (recommended)

Open the project in VS Code and select **"Reopen in Container"**. The container installs Node.js, the `vp` CLI, and all dependencies automatically.

## Without Dev Container

1. Install [Vite+](https://vite.plus/):

    **macOS / Linux:**

    ```bash
    curl -fsSL https://vite.plus | bash
    ```

    **Windows:**

    ```powershell
    irm https://vite.plus/ps1 | iex
    ```

2. Install dependencies:

    ```bash
    vp install
    ```

3. Set up commit hooks:

    ```bash
    vp config
    ```

## Commands

```bash
vp check          # Format, lint, and type-check
vp check --fix    # Auto-fix formatting and lint issues
vp lint           # Lint only
vp fmt            # Format only
vp test           # Run tests
```

## Playground

Run the interactive playground in dev mode:

```bash
vp dev
```

## Docs

Run the documentation site locally:

```bash
vp run docs:dev
```

## Tests

Tests run in Node, and in Chromium via Playwright:

```bash
vp test --project node
vp test --project browser
```

Cross-runtime smoke tests (Node, Bun, Deno):

```bash
node tests/ssr-smoke.mjs
bun tests/ssr-smoke.mjs
deno run --allow-read tests/ssr-smoke.mjs
```

## Watch Mode

Re-runs tests automatically on file changes:

```bash
vp test --watch
```
