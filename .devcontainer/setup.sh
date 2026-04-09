#!/usr/bin/env bash
set -e

# Vite+
curl -fsSL https://vite.plus | bash
export PATH="$HOME/.vite-plus/bin:$PATH"
vp install

# Bun
curl -fsSL https://bun.sh/install | bash

# Deno
curl -fsSL https://deno.land/install.sh | sh

# Playwright browsers
npx playwright install chromium --with-deps
