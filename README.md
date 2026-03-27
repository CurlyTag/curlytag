# curlytag

CurlyTag - Open Source JavaScript Template Engine

## Development

This project uses [Vite+](https://viteplus.dev/) for formatting (Oxfmt), linting (Oxlint), and commit hooks.

### Using Dev Container (recommended)

Open the project in VS Code and select **"Reopen in Container"**. The container will automatically:

- Install Node.js (LTS)
- Install `vp` CLI (Vite+)
- Install project dependencies

After the container starts, you're ready to work.

### Without Dev Container

1. Install [Vite+](https://viteplus.dev/guide/):

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

### Commands

```bash
vp check          # Format, lint, and type-check
vp check --fix    # Auto-fix formatting and lint issues
vp lint           # Lint only
vp fmt            # Format only
vp test           # Run tests once
```

### Development Workflow

Run tests in watch mode — tests re-run automatically on file changes:

```bash
vp test --watch
```

Run tests with a browser UI for interactive exploration:

```bash
vp test --ui --watch
```

> [!NOTE]
>
> The UI starts at `http://localhost:51204/__vitest__/` and stays open as long as the process is running. Always use `--watch` together with `--ui`, otherwise the server exits right after the test run.
